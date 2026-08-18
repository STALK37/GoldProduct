
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS price_small_retail numeric,
  ADD COLUMN IF NOT EXISTS price_small_wholesale numeric,
  ADD COLUMN IF NOT EXISTS price_large_retail numeric,
  ADD COLUMN IF NOT EXISTS price_large_wholesale numeric,
  ADD COLUMN IF NOT EXISTS weight_small text,
  ADD COLUMN IF NOT EXISTS weight_large text;

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS variant text;

-- Seed prices
UPDATE public.products SET price_small_retail=86,  price_small_wholesale=78, price_large_retail=352, price_large_wholesale=320, weight_small='70 г', weight_large='0,5 кг' WHERE name='Курка Теріякі';
UPDATE public.products SET price_small_retail=92,  price_small_wholesale=83, price_large_retail=385, price_large_wholesale=350, weight_small='70 г', weight_large='0,5 кг' WHERE name IN ('Паличка куряча «Пікантна»','Паличка індички','Чипси індички','Чипси качки «По-пекінськи»','Чипса куряча з копченою паприкою');
UPDATE public.products SET price_small_retail=99,  price_small_wholesale=90, price_large_retail=440, price_large_wholesale=400, weight_small='70 г', weight_large='0,5 кг' WHERE name='Чипси свинини «Карпаччо»';
UPDATE public.products SET price_small_retail=77,  price_small_wholesale=70, price_large_retail=341, price_large_wholesale=310, weight_small='70 г', weight_large='0,5 кг' WHERE name='Паличка Макрелі';
UPDATE public.products SET price_small_retail=80,  price_small_wholesale=72, price_large_retail=352, price_large_wholesale=320, weight_small='70 г', weight_large='0,5 кг' WHERE name IN ('Паличка Щуки','Паличка Окуня');
UPDATE public.products SET price_small_retail=63,  price_small_wholesale=57, price_large_retail=297, price_large_wholesale=270, weight_small='70 г', weight_large='0,5 кг' WHERE name='Ікряник «Варені раки»';
UPDATE public.products SET price_small_retail=90,  price_small_wholesale=81, price_large_retail=561, price_large_wholesale=510, weight_small='40 г', weight_large='0,5 кг' WHERE name='Креветочка';
-- Стіки (not on official list) — derive ~10% wholesale, 0.5kg approx 5x small × ~0.9
UPDATE public.products SET price_small_retail=37,  price_small_wholesale=33, price_large_retail=165, price_large_wholesale=150, weight_small='70 г', weight_large='0,5 кг' WHERE name LIKE 'Стіки курячі%';
