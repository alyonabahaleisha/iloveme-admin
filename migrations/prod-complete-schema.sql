-- =============================================
-- COMPLETE PRODUCTION SCHEMA FOR ILOVME.AI
-- Run this on your PROD Supabase project
-- =============================================

-- 1. Create outfits table
CREATE TABLE IF NOT EXISTS outfits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_type VARCHAR(50) DEFAULT 'full_outfit',
  combined_image_url TEXT,
  canvas_width INTEGER DEFAULT 800,
  canvas_height INTEGER DEFAULT 1000,
  gender VARCHAR(10) DEFAULT 'woman' CHECK (gender IN ('man', 'woman')),
  category VARCHAR(50) DEFAULT 'Casual' CHECK (category IN ('Casual', 'Work', 'Evening', 'Date Night', 'Sport')),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  outfit_id UUID REFERENCES outfits(id) ON DELETE CASCADE,
  product_name VARCHAR(255),
  product_link TEXT,
  original_image_url TEXT,
  processed_image_url TEXT NOT NULL,
  category VARCHAR(50),
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 0,
  scale_x FLOAT DEFAULT 1,
  scale_y FLOAT DEFAULT 1,
  rotation FLOAT DEFAULT 0,
  width FLOAT,
  height FLOAT,
  z_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  user_email TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Create indexes
CREATE INDEX IF NOT EXISTS idx_products_outfit_id ON products(outfit_id);
CREATE INDEX IF NOT EXISTS idx_outfits_created_at ON outfits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_outfits_gender ON outfits(gender);
CREATE INDEX IF NOT EXISTS idx_outfits_category ON outfits(category);
CREATE INDEX IF NOT EXISTS idx_outfits_is_published ON outfits(is_published);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- 5. Enable Row Level Security
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for outfits
CREATE POLICY "Allow all operations for authenticated users" ON outfits
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for anon users" ON outfits
  FOR ALL TO anon
  USING (true) WITH CHECK (true);

-- 7. Create RLS policies for products
CREATE POLICY "Allow all operations for authenticated users" ON products
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for anon users" ON products
  FOR ALL TO anon
  USING (true) WITH CHECK (true);

-- 8. Create RLS policies for feedback
CREATE POLICY "Allow insert for anon users" ON feedback
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON feedback
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow select for anon users" ON feedback
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Allow delete for anon users" ON feedback
  FOR DELETE TO anon
  USING (true);

-- 9. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Create trigger for outfits
DROP TRIGGER IF EXISTS update_outfits_updated_at ON outfits;
CREATE TRIGGER update_outfits_updated_at
  BEFORE UPDATE ON outfits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- AFTER RUNNING THIS SQL:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create bucket named: outfit-images
-- 3. Set bucket to PUBLIC
-- =============================================
