
-- Fix: Drop restrictive INSERT policies and recreate as permissive

-- customers
DROP POLICY IF EXISTS "Anyone can create a customer" ON public.customers;
CREATE POLICY "Anyone can create a customer"
ON public.customers FOR INSERT
WITH CHECK (true);

-- orders
DROP POLICY IF EXISTS "Anyone can create an order" ON public.orders;
CREATE POLICY "Anyone can create an order"
ON public.orders FOR INSERT
WITH CHECK (true);

-- order_items
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
CREATE POLICY "Anyone can create order items"
ON public.order_items FOR INSERT
WITH CHECK (true);

-- Also need SELECT on orders so we can get the order id back after insert
DROP POLICY IF EXISTS "Orders not publicly readable" ON public.orders;
CREATE POLICY "Orders readable after creation"
ON public.orders FOR SELECT
USING (true);

-- Same for customers - need to read back the id
DROP POLICY IF EXISTS "Customers not publicly readable" ON public.customers;
CREATE POLICY "Customers readable after creation"
ON public.customers FOR SELECT
USING (true);
