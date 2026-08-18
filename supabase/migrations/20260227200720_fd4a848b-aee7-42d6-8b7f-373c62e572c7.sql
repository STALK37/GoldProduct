
-- Add weight column to products
ALTER TABLE public.products ADD COLUMN weight text;

-- Create product_images table for multi-angle photos
CREATE TABLE public.product_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Product images are publicly readable
CREATE POLICY "Product images are publicly readable"
  ON public.product_images FOR SELECT
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);
