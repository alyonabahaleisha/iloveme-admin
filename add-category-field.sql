-- Add category field to outfits table
ALTER TABLE outfits
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'Casual' CHECK (category IN ('Casual', 'Work', 'Evening', 'Date Night'));

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_outfits_category ON outfits(category);

-- Add comment to explain the field
COMMENT ON COLUMN outfits.category IS 'Style category for outfit: Casual, Work, Evening, or Date Night';
