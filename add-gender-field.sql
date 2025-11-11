-- Add gender field to outfits table
ALTER TABLE outfits
ADD COLUMN IF NOT EXISTS gender VARCHAR(10) DEFAULT 'woman' CHECK (gender IN ('man', 'woman'));

-- Create index for gender filtering
CREATE INDEX IF NOT EXISTS idx_outfits_gender ON outfits(gender);

-- Add comment to explain the field
COMMENT ON COLUMN outfits.gender IS 'Gender category for outfit: man or woman';
