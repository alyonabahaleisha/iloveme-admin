-- ============================================
-- Add Publishing Feature to iLovMe Admin
-- ============================================

-- Add is_published column to outfits table
ALTER TABLE outfits
  ADD COLUMN is_published BOOLEAN DEFAULT false;

-- Create index for faster queries on published outfits
CREATE INDEX idx_outfits_published
  ON outfits(is_published)
  WHERE is_published = true;

-- Enable Row Level Security on both tables
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public (anonymous) users to read published outfits
CREATE POLICY "Public read published outfits" ON outfits
  FOR SELECT TO anon
  USING (is_published = true);

-- Allow public users to read products of published outfits
CREATE POLICY "Public read products of published outfits" ON products
  FOR SELECT TO anon
  USING (
    outfit_id IN (
      SELECT id FROM outfits WHERE is_published = true
    )
  );

-- Allow authenticated users (admin) full access to outfits
CREATE POLICY "Authenticated full access to outfits" ON outfits
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users (admin) full access to products
CREATE POLICY "Authenticated full access to products" ON products
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Test query to see published outfits (should return empty for now)
SELECT id, name, is_published FROM outfits WHERE is_published = true;
