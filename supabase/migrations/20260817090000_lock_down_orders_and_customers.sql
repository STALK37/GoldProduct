-- ============================================================================
-- Close the public read on customers / orders, and move order creation into a
-- SECURITY DEFINER function.
--
-- Background
-- ----------
-- Migration 20260228195548 replaced the two "not publicly readable" policies on
-- public.customers and public.orders with `USING (true)`, so that the checkout
-- could read the new row's id back from `INSERT ... RETURNING`. The side effect
-- was that anyone holding the anon key -- which ships in the browser bundle by
-- design -- could read every customer record (name, email, phone, full postal
-- address) and every order.
--
-- The read-back is a real requirement, so this migration solves it a different
-- way rather than simply reverting: public.place_order() runs as its definer,
-- creates the customer, the order and the line items in one transaction, and
-- returns only the new order's id and total.
--
-- Two things fall out of that:
--   * customers, orders and order_items no longer need *any* policy for the
--     anon role. RLS with no matching policy denies by default.
--   * the basket is priced from public.products server-side, so a crafted
--     request can no longer book an order at a price of its own choosing.
--
-- Apply with `supabase db push`, or paste into the SQL editor.
-- ============================================================================


-- 1. Reads --------------------------------------------------------------------

DROP POLICY IF EXISTS "Customers readable after creation" ON public.customers;
DROP POLICY IF EXISTS "Orders readable after creation"    ON public.orders;

-- `USING (false)` policies are redundant once nothing else grants SELECT, and
-- leaving them behind suggests a deny is doing work that default-deny already
-- does. Dropped so the remaining policies are the whole story.
DROP POLICY IF EXISTS "Service role can read orders"      ON public.orders;
DROP POLICY IF EXISTS "Order items not publicly readable" ON public.order_items;

-- The admin panel reads orders with `.select("*, customers(*)")`, so it needs
-- both tables. order_items already has "Admins can read order items".
CREATE POLICY "Admins can read customers" ON public.customers
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read orders" ON public.orders
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));


-- 2. Writes -------------------------------------------------------------------
-- place_order() is now the only path in, so the public INSERT policies go.

DROP POLICY IF EXISTS "Anyone can create a customer"  ON public.customers;
DROP POLICY IF EXISTS "Anyone can create an order"    ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders"      ON public.orders;
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;


-- 3. Order creation -----------------------------------------------------------

-- Wholesale kicks in once the retail subtotal reaches this much. Mirrors
-- WHOLESALE_THRESHOLD in src/contexts/CartContext.tsx -- change both together.
CREATE OR REPLACE FUNCTION public.wholesale_threshold()
RETURNS numeric
LANGUAGE sql
IMMUTABLE
AS $$ SELECT 10000::numeric $$;

COMMENT ON FUNCTION public.wholesale_threshold() IS
  'Retail subtotal at which wholesale prices apply. Mirrors WHOLESALE_THRESHOLD in the frontend cart.';


-- p_customer : { full_name, email, phone?, city, country, post_code, address, notes? }
-- p_items    : [ { product_id: uuid, variant: 'small'|'large', quantity: int }, ... ]
--
-- Returns    : { order_id: uuid, total_amount: numeric, wholesale: boolean }
CREATE OR REPLACE FUNCTION public.place_order(p_customer jsonb, p_items jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_priced      jsonb;
  v_customer_id uuid;
  v_order_id    uuid;
  v_subtotal    numeric := 0;
  v_total       numeric := 0;
  v_wholesale   boolean := false;
BEGIN
  ----------------------------------------------------------------------------
  -- Customer
  ----------------------------------------------------------------------------
  IF p_customer IS NULL OR jsonb_typeof(p_customer) <> 'object' THEN
    RAISE EXCEPTION 'Customer details are required'
      USING ERRCODE = 'check_violation';
  END IF;

  IF coalesce(btrim(p_customer->>'full_name'), '') = ''
     OR coalesce(btrim(p_customer->>'address'), '') = '' THEN
    RAISE EXCEPTION 'Name and address are required'
      USING ERRCODE = 'check_violation';
  END IF;

  IF coalesce(p_customer->>'email', '') !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' THEN
    RAISE EXCEPTION 'A valid email address is required'
      USING ERRCODE = 'check_violation';
  END IF;

  ----------------------------------------------------------------------------
  -- Basket -- priced from public.products, never from the request
  ----------------------------------------------------------------------------
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array'
     OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain at least one item'
      USING ERRCODE = 'check_violation';
  END IF;

  IF jsonb_array_length(p_items) > 100 THEN
    RAISE EXCEPTION 'Too many lines in a single order'
      USING ERRCODE = 'check_violation';
  END IF;

  SELECT jsonb_agg(
           jsonb_build_object(
             'product_id', b.product_id,
             'variant',    b.variant,
             'quantity',   b.quantity,
             'retail',     CASE b.variant
                             WHEN 'large' THEN coalesce(p.price_large_retail, p.price)
                             ELSE              coalesce(p.price_small_retail, p.price)
                           END,
             'wholesale',  CASE b.variant
                             WHEN 'large' THEN coalesce(p.price_large_wholesale, p.price_large_retail, p.price)
                             ELSE              coalesce(p.price_small_wholesale, p.price_small_retail, p.price)
                           END
           )
         )
    INTO v_priced
  FROM (
    SELECT (i->>'product_id')::uuid AS product_id,
           CASE WHEN lower(coalesce(i->>'variant', 'small')) = 'large'
                THEN 'large' ELSE 'small' END AS variant,
           greatest(1, least(999, coalesce((i->>'quantity')::int, 1))) AS quantity
    FROM jsonb_array_elements(p_items) AS i
  ) AS b
  JOIN public.products p ON p.id = b.product_id AND p.in_stock;

  -- A short aggregate means at least one line referenced a product that does
  -- not exist or is out of stock. Fail rather than silently drop it.
  IF v_priced IS NULL OR jsonb_array_length(v_priced) <> jsonb_array_length(p_items) THEN
    RAISE EXCEPTION 'One or more products are unavailable'
      USING ERRCODE = 'check_violation';
  END IF;

  SELECT coalesce(sum((l->>'retail')::numeric * (l->>'quantity')::int), 0)
    INTO v_subtotal
  FROM jsonb_array_elements(v_priced) AS l;

  v_wholesale := v_subtotal >= public.wholesale_threshold();

  SELECT coalesce(sum(
           CASE WHEN v_wholesale THEN (l->>'wholesale')::numeric
                                 ELSE (l->>'retail')::numeric END
           * (l->>'quantity')::int), 0)
    INTO v_total
  FROM jsonb_array_elements(v_priced) AS l;

  ----------------------------------------------------------------------------
  -- Write
  ----------------------------------------------------------------------------
  INSERT INTO public.customers (full_name, email, phone, city, country, post_code, address)
  VALUES (
    left(btrim(p_customer->>'full_name'), 100),
    left(btrim(p_customer->>'email'), 255),
    nullif(left(btrim(coalesce(p_customer->>'phone', '')), 20), ''),
    left(btrim(coalesce(p_customer->>'city', '')), 100),
    left(btrim(coalesce(p_customer->>'country', '')), 100),
    left(btrim(coalesce(p_customer->>'post_code', '')), 20),
    left(btrim(p_customer->>'address'), 300)
  )
  RETURNING id INTO v_customer_id;

  INSERT INTO public.orders (customer_id, total_amount, notes)
  VALUES (
    v_customer_id,
    v_total,
    nullif(left(btrim(coalesce(p_customer->>'notes', '')), 1000), '')
  )
  RETURNING id INTO v_order_id;

  INSERT INTO public.order_items (order_id, product_id, quantity, unit_price, variant)
  SELECT v_order_id,
         (l->>'product_id')::uuid,
         (l->>'quantity')::int,
         CASE WHEN v_wholesale THEN (l->>'wholesale')::numeric
                               ELSE (l->>'retail')::numeric END,
         l->>'variant'
  FROM jsonb_array_elements(v_priced) AS l;

  RETURN jsonb_build_object(
    'order_id',     v_order_id,
    'total_amount', v_total,
    'wholesale',    v_wholesale
  );
END;
$$;

COMMENT ON FUNCTION public.place_order(jsonb, jsonb) IS
  'Creates a customer, an order and its line items in one transaction and returns the order id and authoritative total. Prices the basket from public.products; the caller cannot set prices. Only write path into these tables.';

REVOKE ALL ON FUNCTION public.place_order(jsonb, jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.place_order(jsonb, jsonb) TO anon, authenticated;


-- 4. Notifications ------------------------------------------------------------
-- The on_new_order trigger from 20260301125335 still does the work, and it is
-- SECURITY DEFINER, so it writes as the table owner and does not need a policy.
-- The open INSERT policy it shipped alongside let anyone with the anon key push
-- arbitrary rows into the admin's notification feed.

DROP POLICY IF EXISTS "Service can insert notifications" ON public.admin_notifications;

-- Same trigger, corrected currency. The store prices in hryvnia; the original
-- message was built with ₸ (Kazakhstani tenge).
CREATE OR REPLACE FUNCTION public.notify_new_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, order_id)
  VALUES (
    'new_order',
    'Новий заказ',
    'Отримано нове замовлення #' || left(NEW.id::text, 8) ||
      ' на суму ' || NEW.total_amount || ' ₴',
    NEW.id
  );
  RETURN NEW;
END;
$$;
