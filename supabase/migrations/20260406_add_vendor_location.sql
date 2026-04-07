-- Add location columns to vendors table for proximity-based search
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS longitude double precision;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS address text;

-- Index for location-based queries (bounding box search)
CREATE INDEX IF NOT EXISTS idx_vendors_location ON vendors (latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Comment
COMMENT ON COLUMN vendors.latitude IS 'Vendor business latitude coordinate';
COMMENT ON COLUMN vendors.longitude IS 'Vendor business longitude coordinate';
COMMENT ON COLUMN vendors.address IS 'Full street address of vendor business';
