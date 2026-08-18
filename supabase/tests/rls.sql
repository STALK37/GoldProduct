-- Row-level-security tests.
--
-- These exist because the single worst bug this project has shipped was an RLS
-- policy that read `USING (true)` on public.customers -- every customer's name,
-- email, phone and postal address readable by anyone holding the anon key,
-- which is published in the browser bundle. A policy regression is silent: the
-- app keeps working, and nothing tells you the data is open. So it gets tests.
--
-- Run with supabase/tests/run.sh (spins up a throwaway PostgreSQL, applies
-- every migration, then this file). CI runs it on every push.

\set ON_ERROR_STOP on

CREATE OR REPLACE FUNCTION assert(condition boolean, what text)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF condition IS NOT TRUE THEN
    RAISE EXCEPTION 'FAIL: %', what;
  END IF;
  RAISE NOTICE '  ok  %', what;
END $$;

-- Did a statement fail the way we expect it to?
CREATE OR REPLACE FUNCTION denied(stmt text)
RETURNS boolean LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE stmt;
  RETURN false;
EXCEPTION
  WHEN insufficient_privilege THEN RETURN true;
  WHEN check_violation      THEN RETURN true;
END $$;


-- ---------------------------------------------------------------------------
-- Fixtures
-- ---------------------------------------------------------------------------
\echo ''
\echo 'Seeding fixtures'

INSERT INTO auth.users (id, email) VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'shopper@example.com');

INSERT INTO public.user_roles (user_id, role)
VALUES ('11111111-1111-1111-1111-111111111111', 'admin');

INSERT INTO public.products
  (id, name, price, in_stock,
   price_small_retail, price_small_wholesale, price_large_retail, price_large_wholesale,
   weight_small, weight_large)
VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Чипси індички', 92, true,
   92, 83, 385, 350, '70 г', '0,5 кг'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'Креветочка', 90, true,
   90, 81, 561, 510, '40 г', '0,5 кг'),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'Знято з продажу', 50, false,
   50, 45, 250, 225, '70 г', '0,5 кг');

-- A pre-existing order, so the read tests have something to fail to read.
DO $$
BEGIN
  PERFORM public.place_order(
    '{"full_name":"Тестовий Клієнт","email":"seed@example.com","phone":"+380 44 000 00 00",
      "city":"Київ","country":"Україна","post_code":"01001","address":"вул. Хрещатик, 1"}'::jsonb,
    '[{"product_id":"aaaaaaaa-0000-0000-0000-000000000001","variant":"small","quantity":1}]'::jsonb
  );
END $$;


-- ---------------------------------------------------------------------------
-- Anonymous visitors
-- ---------------------------------------------------------------------------
\echo ''
\echo 'As anon'

SET ROLE anon;

-- The migrations seed two category rows of their own, so count the fixtures.
SELECT assert(
  (SELECT count(*) FROM public.products
    WHERE id::text LIKE 'aaaaaaaa-0000-%') = 3,
  'products are publicly readable — the catalogue needs them');

SELECT assert((SELECT count(*) FROM public.customers) = 0,
  'customers are NOT readable');

SELECT assert((SELECT count(*) FROM public.orders) = 0,
  'orders are NOT readable');

SELECT assert((SELECT count(*) FROM public.order_items) = 0,
  'order_items are NOT readable');

SELECT assert(denied($$
  INSERT INTO public.customers (full_name, email, address)
  VALUES ('Mallory', 'm@example.com', 'nowhere')
$$), 'customers cannot be written to directly');

SELECT assert(denied($$
  INSERT INTO public.orders (customer_id, total_amount)
  VALUES ('11111111-1111-1111-1111-111111111111', 0)
$$), 'orders cannot be written to directly');

SELECT assert(denied($$
  INSERT INTO public.admin_notifications (type, title, message)
  VALUES ('new_order', 'spam', 'spam')
$$), 'the admin notification feed cannot be spammed');

SELECT assert((SELECT count(*) FROM public.user_roles) = 0,
  'user_roles are not readable — no enumerating the admins');


-- ---------------------------------------------------------------------------
-- Checkout
-- ---------------------------------------------------------------------------
\echo ''
\echo 'Checkout via place_order()'

-- 2 × 92 = 184, below the 10 000 wholesale threshold.
SELECT assert(
  (public.place_order(
    '{"full_name":"Олена Ковальчук","email":"olena@example.com","phone":"+380 44 123 45 67",
      "city":"Львів","country":"Україна","post_code":"79000","address":"вул. Січових Стрільців, 12"}'::jsonb,
    '[{"product_id":"aaaaaaaa-0000-0000-0000-000000000001","variant":"small","quantity":2}]'::jsonb
  )->>'total_amount')::numeric = 184,
  'retail pricing — 2 × 92 = 184');

-- 30 × 385 = 11 550 retail, so wholesale applies: 30 × 350 = 10 500.
SELECT assert(
  (public.place_order(
    '{"full_name":"Гурт Клієнт","email":"gurt@example.com",
      "city":"Одеса","country":"Україна","post_code":"65000","address":"вул. Дерибасівська, 5"}'::jsonb,
    '[{"product_id":"aaaaaaaa-0000-0000-0000-000000000001","variant":"large","quantity":30}]'::jsonb
  )->>'total_amount')::numeric = 10500,
  'wholesale pricing kicks in past the threshold');

SELECT assert(
  (public.place_order(
    '{"full_name":"Ціновий Тест","email":"price@example.com",
      "city":"Київ","country":"Україна","post_code":"01001","address":"вул. Хрещатик, 2"}'::jsonb,
    '[{"product_id":"aaaaaaaa-0000-0000-0000-000000000001","variant":"small","quantity":1,
       "unit_price":1,"price":1,"total_amount":1}]'::jsonb
  )->>'total_amount')::numeric = 92,
  'a client-supplied price is ignored — this is the whole point of the function');

SELECT assert(denied($$
  SELECT public.place_order(
    '{"full_name":"X","email":"not-an-email","city":"Київ","country":"Україна",
      "post_code":"01001","address":"вул. Хрещатик, 3"}'::jsonb,
    '[{"product_id":"aaaaaaaa-0000-0000-0000-000000000001","variant":"small","quantity":1}]'::jsonb)
$$), 'a malformed email is rejected');

SELECT assert(denied($$
  SELECT public.place_order(
    '{"full_name":"X","email":"x@example.com","city":"Київ","country":"Україна",
      "post_code":"01001","address":"вул. Хрещатик, 4"}'::jsonb,
    '[]'::jsonb)
$$), 'an empty basket is rejected');

SELECT assert(denied($$
  SELECT public.place_order(
    '{"full_name":"X","email":"x@example.com","city":"Київ","country":"Україна",
      "post_code":"01001","address":"вул. Хрещатик, 5"}'::jsonb,
    '[{"product_id":"aaaaaaaa-0000-0000-0000-000000000003","variant":"small","quantity":1}]'::jsonb)
$$), 'an out-of-stock product is rejected');

SELECT assert(denied($$
  SELECT public.place_order(
    '{"full_name":"X","email":"x@example.com","city":"Київ","country":"Україна",
      "post_code":"01001","address":"вул. Хрещатик, 6"}'::jsonb,
    '[{"product_id":"00000000-0000-0000-0000-0000000000ff","variant":"small","quantity":1}]'::jsonb)
$$), 'an unknown product is rejected');

SELECT assert(
  (public.place_order(
    '{"full_name":"Кількість","email":"qty@example.com",
      "city":"Київ","country":"Україна","post_code":"01001","address":"вул. Хрещатик, 7"}'::jsonb,
    '[{"product_id":"aaaaaaaa-0000-0000-0000-000000000001","variant":"small","quantity":-5}]'::jsonb
  )->>'total_amount')::numeric = 92,
  'a negative quantity is clamped to 1, not treated as a refund');

SELECT assert((SELECT count(*) FROM public.orders) = 0,
  'and anon still cannot read back any of the orders it just created');

RESET ROLE;


-- ---------------------------------------------------------------------------
-- Signed in, but not an admin
-- ---------------------------------------------------------------------------
\echo ''
\echo 'As a signed-in shopper'

SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', false);

SELECT assert((SELECT count(*) FROM public.customers) = 0,
  'a signed-in non-admin cannot read customers');
SELECT assert((SELECT count(*) FROM public.orders) = 0,
  'a signed-in non-admin cannot read orders');
SELECT assert((SELECT count(*) FROM public.admin_notifications) = 0,
  'a signed-in non-admin cannot read the notification feed');

RESET ROLE;


-- ---------------------------------------------------------------------------
-- Admin
-- ---------------------------------------------------------------------------
\echo ''
\echo 'As an admin'

SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);

-- Five baskets made it through above; the four rejected ones left nothing.
SELECT assert((SELECT count(*) FROM public.orders) = 5,
  'an admin reads every order');
SELECT assert((SELECT count(*) FROM public.customers) = 5,
  'an admin reads every customer — the panel joins customers(*)');
SELECT assert((SELECT count(*) FROM public.order_items) = 5,
  'an admin reads the line items');
SELECT assert((SELECT count(*) FROM public.admin_notifications) = 5,
  'every order raised exactly one notification, and rejected baskets raised none');

DO $$
DECLARE v_id uuid;
BEGIN
  SELECT id INTO v_id FROM public.orders LIMIT 1;
  UPDATE public.orders SET status = 'shipped' WHERE id = v_id;
  PERFORM assert(
    (SELECT status FROM public.orders WHERE id = v_id) = 'shipped',
    'an admin can move an order along');
END $$;

RESET ROLE;

\echo ''
\echo 'All row-level-security tests passed.'
\echo ''
