
-- Update product images
UPDATE products SET image_url = '/products/chicken-sticks-black-pepper.jpg' WHERE id = '93b7538b-3602-41b1-be1d-46639db2f39b';
UPDATE products SET image_url = '/products/mackerel-stick.jpg' WHERE id = '617301ae-9d25-42fc-9a35-64d5572600b4';
UPDATE products SET image_url = '/products/chicken-teriyaki-2.jpg' WHERE id = '044b21d3-7f47-45d5-8075-2602129f8727';

-- Delete Стіки курячі з часником
DELETE FROM product_images WHERE product_id = 'db9d0a55-d178-43f7-ad03-7ff239b34780';
DELETE FROM order_items WHERE product_id = 'db9d0a55-d178-43f7-ad03-7ff239b34780';
DELETE FROM products WHERE id = 'db9d0a55-d178-43f7-ad03-7ff239b34780';
