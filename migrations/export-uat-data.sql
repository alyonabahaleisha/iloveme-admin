-- =============================================
-- EXPORT OUTFITS & PRODUCTS FROM UAT
-- Run this on UAT Supabase SQL Editor
-- Copy results and run on PROD Supabase
-- =============================================

-- Step 1: Export all outfits (with gender, category, is_published)
SELECT
  'INSERT INTO outfits (id, name, description, template_type, combined_image_url, canvas_width, canvas_height, gender, category, is_published, created_at, updated_at) VALUES (' ||
  '''' || id || ''', ' ||
  '''' || REPLACE(name, '''', '''''') || ''', ' ||
  COALESCE('''' || REPLACE(description, '''', '''''') || '''', 'NULL') || ', ' ||
  '''' || template_type || ''', ' ||
  COALESCE('''' || combined_image_url || '''', 'NULL') || ', ' ||
  canvas_width || ', ' ||
  canvas_height || ', ' ||
  '''' || COALESCE(gender, 'woman') || ''', ' ||
  '''' || COALESCE(category, 'Casual') || ''', ' ||
  COALESCE(is_published::text, 'false') || ', ' ||
  '''' || created_at || ''', ' ||
  '''' || updated_at || ''');' AS sql
FROM outfits
ORDER BY created_at;

-- Step 2: Export all products
SELECT
  'INSERT INTO products (id, outfit_id, product_name, product_link, original_image_url, processed_image_url, category, position_x, position_y, scale_x, scale_y, rotation, width, height, z_index, created_at) VALUES (' ||
  '''' || id || ''', ' ||
  '''' || outfit_id || ''', ' ||
  COALESCE('''' || REPLACE(product_name, '''', '''''') || '''', 'NULL') || ', ' ||
  COALESCE('''' || product_link || '''', 'NULL') || ', ' ||
  COALESCE('''' || original_image_url || '''', 'NULL') || ', ' ||
  '''' || processed_image_url || ''', ' ||
  COALESCE('''' || category || '''', 'NULL') || ', ' ||
  position_x || ', ' ||
  position_y || ', ' ||
  scale_x || ', ' ||
  scale_y || ', ' ||
  rotation || ', ' ||
  COALESCE(width::text, 'NULL') || ', ' ||
  COALESCE(height::text, 'NULL') || ', ' ||
  z_index || ', ' ||
  '''' || created_at || ''');' AS sql
FROM products
ORDER BY created_at;
