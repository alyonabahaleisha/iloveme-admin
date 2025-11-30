-- =============================================
-- EXPORT DATA FROM UAT SUPABASE
-- Run this on UAT Supabase SQL Editor
-- Copy the results and run on PROD
-- =============================================

-- This generates INSERT statements for your data
-- Run each section and copy the output

-- SECTION 1: Export outfits
SELECT
  'INSERT INTO outfits (id, name, description, template_type, combined_image_url, canvas_width, canvas_height, gender, category, is_published, created_at, updated_at) VALUES (' ||
  quote_literal(id) || ', ' ||
  quote_literal(name) || ', ' ||
  COALESCE(quote_literal(description), 'NULL') || ', ' ||
  quote_literal(template_type) || ', ' ||
  COALESCE(quote_literal(combined_image_url), 'NULL') || ', ' ||
  canvas_width || ', ' ||
  canvas_height || ', ' ||
  quote_literal(COALESCE(gender, 'woman')) || ', ' ||
  quote_literal(COALESCE(category, 'Casual')) || ', ' ||
  is_published || ', ' ||
  quote_literal(created_at) || ', ' ||
  quote_literal(updated_at) || ');'
AS insert_statement
FROM outfits;

-- SECTION 2: Export products
SELECT
  'INSERT INTO products (id, outfit_id, product_name, product_link, original_image_url, processed_image_url, category, position_x, position_y, scale_x, scale_y, rotation, width, height, z_index, created_at) VALUES (' ||
  quote_literal(id) || ', ' ||
  quote_literal(outfit_id) || ', ' ||
  COALESCE(quote_literal(product_name), 'NULL') || ', ' ||
  COALESCE(quote_literal(product_link), 'NULL') || ', ' ||
  COALESCE(quote_literal(original_image_url), 'NULL') || ', ' ||
  quote_literal(processed_image_url) || ', ' ||
  COALESCE(quote_literal(category), 'NULL') || ', ' ||
  position_x || ', ' ||
  position_y || ', ' ||
  scale_x || ', ' ||
  scale_y || ', ' ||
  rotation || ', ' ||
  COALESCE(width::text, 'NULL') || ', ' ||
  COALESCE(height::text, 'NULL') || ', ' ||
  z_index || ', ' ||
  quote_literal(created_at) || ');'
AS insert_statement
FROM products;

-- SECTION 3: Export feedback (optional)
SELECT
  'INSERT INTO feedback (id, user_id, user_email, message, created_at) VALUES (' ||
  quote_literal(id) || ', ' ||
  COALESCE(quote_literal(user_id), 'NULL') || ', ' ||
  COALESCE(quote_literal(user_email), 'NULL') || ', ' ||
  quote_literal(message) || ', ' ||
  quote_literal(created_at) || ');'
AS insert_statement
FROM feedback;
