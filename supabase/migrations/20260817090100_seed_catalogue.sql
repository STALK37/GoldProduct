-- ============================================================================
-- Seed the product catalogue.
--
-- The catalogue was originally typed straight into the hosted database, so it
-- lived nowhere in this repository: `supabase db push` gave you a working shop
-- with nothing in it, and every page that reads `products` came up empty. The
-- rows below reproduce it from the prices in 20260519164719 and the images in
-- public/products/.
--
-- Idempotent — matched on name, so re-running will not duplicate anything, and
-- it will not overwrite a catalogue you have since edited.
-- ============================================================================

INSERT INTO public.products
  (name, description, category, image_url, in_stock, price,
   price_small_retail, price_small_wholesale,
   price_large_retail, price_large_wholesale,
   weight_small, weight_large)
SELECT v.* FROM (VALUES
  -- М'ясні снеки ------------------------------------------------------------
  ('Курка Теріякі',
   'Куряче філе в соусі теріякі — солодко-солоний баланс, повільне в''ялення, жодних консервантів.',
   'meat', '/products/chicken-sticks-teriyaki.jpg', true, 86,
   86, 78, 352, 320, '70 г', '0,5 кг'),

  ('Паличка куряча «Пікантна»',
   'Куряча паличка з паприкою та перцем чилі. Гостра, щільна, з вираженим ароматом копчення.',
   'meat', '/products/spicy-stick-1.jpg', true, 92,
   92, 83, 385, 350, '70 г', '0,5 кг'),

  ('Паличка індички',
   'Пісне філе індички, в''ялене за низької температури. М''яка текстура, чистий смак.',
   'meat', '/products/turkey-stick.jpg', true, 92,
   92, 83, 385, 350, '70 г', '0,5 кг'),

  ('Чипси індички',
   'Тонко нарізане філе індички, висушене до хрусткої скибочки. Високий вміст білка.',
   'meat', '/products/turkey-chips-1.jpg', true, 92,
   92, 83, 385, 350, '70 г', '0,5 кг'),

  ('Чипси качки «По-пекінськи»',
   'Качине філе у медово-соєвому маринаді за мотивами пекінської качки.',
   'meat', '/products/duck-chips-1.jpg', true, 92,
   92, 83, 385, 350, '70 г', '0,5 кг'),

  ('Чипса куряча з копченою паприкою',
   'Куряче філе з іспанською копченою паприкою — глибокий димний аромат без диму.',
   'meat', '/products/chicken-chips-smoked-paprika.jpg', true, 92,
   92, 83, 385, 350, '70 г', '0,5 кг'),

  ('Чипси свинини «Карпаччо»',
   'Свиняча вирізка, нарізана до прозорості та в''ялена з розмарином і чорним перцем.',
   'meat', '/products/pork-carpaccio-1.jpg', true, 99,
   99, 90, 440, 400, '70 г', '0,5 кг'),

  ('Стіки курячі з чорним перцем',
   'Тонкі курячі стіки зі свіжомеленим чорним перцем. Формат на один раз.',
   'meat', '/products/chicken-sticks-black-pepper.jpg', true, 37,
   37, 33, 165, 150, '70 г', '0,5 кг'),

  ('Стіки курячі з пармезаном',
   'Курячі стіки з витриманим пармезаном — солоно-горіховий профіль.',
   'meat', '/products/chicken-sticks-parmesan.jpg', true, 37,
   37, 33, 165, 150, '70 г', '0,5 кг'),

  ('Стіки курячі з паприкою',
   'Курячі стіки з солодкою паприкою. Найм''якіший варіант лінійки.',
   'meat', '/products/chicken-sticks-paprika.jpg', true, 37,
   37, 33, 165, 150, '70 г', '0,5 кг'),

  -- Рибні снеки -------------------------------------------------------------
  ('Паличка Макрелі',
   'Макрель холодного копчення, в''ялена смужками. Насичена омега-3.',
   'fish', '/products/mackerel-stick.jpg', true, 77,
   77, 70, 341, 310, '70 г', '0,5 кг'),

  ('Паличка Щуки',
   'Річкова щука, підсолена та висушена. Пісна, щільна, з чистим смаком.',
   'fish', '/products/pike-stick-1.jpg', true, 80,
   80, 72, 352, 320, '70 г', '0,5 кг'),

  ('Паличка Окуня',
   'Окунь, в''ялений цілими смужками філе. Класика до пива.',
   'fish', '/products/perch-stick.jpg', true, 80,
   80, 72, 352, 320, '70 г', '0,5 кг'),

  ('Ікряник «Варені раки»',
   'Пресований ікряник з ароматом варених раків — впізнаваний смак у сухому форматі.',
   'fish', '/products/boiled-crayfish.jpg', true, 63,
   63, 57, 297, 270, '70 г', '0,5 кг'),

  ('Креветочка',
   'Сушена креветка цілком, легке підсолювання. Найменша фасовка в лінійці.',
   'fish', '/products/shrimp-snack.jpg', true, 90,
   90, 81, 561, 510, '40 г', '0,5 кг')
) AS v(name, description, category, image_url, in_stock, price,
       price_small_retail, price_small_wholesale,
       price_large_retail, price_large_wholesale,
       weight_small, weight_large)
-- No unique constraint on name, so guard by hand rather than ON CONFLICT.
WHERE NOT EXISTS (SELECT 1 FROM public.products p WHERE p.name = v.name);


-- Extra shots for the product-page gallery.
INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT p.id, v.image_url, v.sort_order
FROM public.products p
JOIN (VALUES
  ('Курка Теріякі',               '/products/chicken-teriyaki-2.jpg', 1),
  ('Паличка куряча «Пікантна»',   '/products/spicy-stick-2.jpg',      1),
  ('Чипси індички',               '/products/turkey-chips-2.jpg',     1),
  ('Чипси індички',               '/products/turkey-chips-4.jpg',     2),
  ('Чипси качки «По-пекінськи»',  '/products/duck-chips-2.jpg',       1),
  ('Чипси качки «По-пекінськи»',  '/products/duck-chips-3.jpg',       2),
  ('Чипси свинини «Карпаччо»',    '/products/pork-carpaccio-2.jpg',   1)
) AS v(name, image_url, sort_order) ON v.name = p.name
WHERE NOT EXISTS (
  SELECT 1 FROM public.product_images pi
  WHERE pi.product_id = p.id AND pi.image_url = v.image_url
);
