
-- Drop old orders table
DROP TABLE IF EXISTS public.orders;

-- Customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  country TEXT,
  post_code TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  category TEXT,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Orders table (FK to customers)
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Order items table (FK to orders and products)
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Products: publicly readable
CREATE POLICY "Products are publicly readable"
ON public.products FOR SELECT USING (true);

-- Customers: anyone can insert (placing an order), no public read
CREATE POLICY "Anyone can create a customer"
ON public.customers FOR INSERT WITH CHECK (true);

CREATE POLICY "Customers not publicly readable"
ON public.customers FOR SELECT USING (false);

-- Orders: anyone can insert, no public read
CREATE POLICY "Anyone can create an order"
ON public.orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Orders not publicly readable"
ON public.orders FOR SELECT USING (false);

-- Order items: anyone can insert, no public read
CREATE POLICY "Anyone can create order items"
ON public.order_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Order items not publicly readable"
ON public.order_items FOR SELECT USING (false);

-- Update trigger for orders
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed products
INSERT INTO public.products (name, description, price, category) VALUES
  ('М''ясні снеки', 'Ситні, хрусткі — ідеальні до дороги та фільму.', 89.00, 'meat'),
  ('Рибні снеки', 'Смак моря — легкі та ідеальні до напоїв.', 79.00, 'fish');
