-- Add coordinates to cities
ALTER TABLE cities ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8);
ALTER TABLE cities ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);

-- Add location fields to vendors
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS address TEXT;

-- Populate GTA city coordinates
UPDATE cities SET latitude = 43.6532, longitude = -79.3832 WHERE slug = 'toronto';
UPDATE cities SET latitude = 43.7315, longitude = -79.7624 WHERE slug = 'brampton';
UPDATE cities SET latitude = 43.5890, longitude = -79.6441 WHERE slug = 'mississauga';
UPDATE cities SET latitude = 43.8561, longitude = -79.3370 WHERE slug = 'markham';
UPDATE cities SET latitude = 43.8361, longitude = -79.4983 WHERE slug = 'vaughan';
UPDATE cities SET latitude = 43.7731, longitude = -79.2577 WHERE slug = 'scarborough';
UPDATE cities SET latitude = 43.8828, longitude = -79.4403 WHERE slug = 'richmond-hill';
UPDATE cities SET latitude = 43.4675, longitude = -79.6877 WHERE slug = 'oakville';
UPDATE cities SET latitude = 43.6205, longitude = -79.5132 WHERE slug = 'etobicoke';
UPDATE cities SET latitude = 43.7615, longitude = -79.4111 WHERE slug = 'north-york';
UPDATE cities SET latitude = 43.8093, longitude = -79.4510 WHERE slug = 'thornhill';
UPDATE cities SET latitude = 43.7944, longitude = -79.5428 WHERE slug = 'woodbridge';
UPDATE cities SET latitude = 43.7001, longitude = -79.6130 WHERE slug = 'malton';
UPDATE cities SET latitude = 43.5525, longitude = -79.5793 WHERE slug = 'port-credit';
UPDATE cities SET latitude = 43.5763, longitude = -79.7161 WHERE slug = 'streetsville';
UPDATE cities SET latitude = 43.5889, longitude = -79.7595 WHERE slug = 'meadowvale';
UPDATE cities SET latitude = 43.8005, longitude = -79.4878 WHERE slug = 'concord';
UPDATE cities SET latitude = 43.8556, longitude = -79.5079 WHERE slug = 'maple';
UPDATE cities SET latitude = 43.8584, longitude = -79.0204 WHERE slug = 'ajax';
UPDATE cities SET latitude = 43.8384, longitude = -79.0868 WHERE slug = 'pickering';
UPDATE cities SET latitude = 43.8971, longitude = -78.8658 WHERE slug = 'oshawa';
UPDATE cities SET latitude = 43.8975, longitude = -78.9429 WHERE slug = 'whitby';
UPDATE cities SET latitude = 43.9100, longitude = -78.6911 WHERE slug = 'bowmanville';
UPDATE cities SET latitude = 43.3255, longitude = -79.7990 WHERE slug = 'burlington';
UPDATE cities SET latitude = 43.5183, longitude = -79.8774 WHERE slug = 'milton';
UPDATE cities SET latitude = 43.6307, longitude = -79.9507 WHERE slug = 'halton-hills';
UPDATE cities SET latitude = 43.6526, longitude = -79.9265 WHERE slug = 'georgetown';
UPDATE cities SET latitude = 43.8601, longitude = -79.8724 WHERE slug = 'caledon';
UPDATE cities SET latitude = 43.8763, longitude = -79.7377 WHERE slug = 'bolton';
UPDATE cities SET latitude = 43.9223, longitude = -79.5266 WHERE slug = 'king-city';
UPDATE cities SET latitude = 43.8668, longitude = -79.5324 WHERE slug = 'kleinburg';
UPDATE cities SET latitude = 43.9384, longitude = -79.5384 WHERE slug = 'nobleton';
UPDATE cities SET latitude = 44.0592, longitude = -79.4613 WHERE slug = 'newmarket';
UPDATE cities SET latitude = 44.0065, longitude = -79.4504 WHERE slug = 'aurora';
UPDATE cities SET latitude = 44.1146, longitude = -79.5452 WHERE slug = 'bradford';
UPDATE cities SET latitude = 44.0771, longitude = -79.4342 WHERE slug = 'east-gwillimbury';
UPDATE cities SET latitude = 44.3116, longitude = -79.6452 WHERE slug = 'innisfil';
UPDATE cities SET latitude = 44.3894, longitude = -79.6903 WHERE slug = 'barrie';
UPDATE cities SET latitude = 43.2557, longitude = -79.8711 WHERE slug = 'hamilton';
UPDATE cities SET latitude = 43.1394, longitude = -80.2644 WHERE slug = 'brantford';
UPDATE cities SET latitude = 43.4516, longitude = -80.4925 WHERE slug = 'kitchener';
UPDATE cities SET latitude = 43.4643, longitude = -80.5204 WHERE slug = 'waterloo';
UPDATE cities SET latitude = 43.3616, longitude = -80.3144 WHERE slug = 'cambridge';
UPDATE cities SET latitude = 43.5448, longitude = -80.2482 WHERE slug = 'guelph';
UPDATE cities SET latitude = 43.9701, longitude = -79.2502 WHERE slug = 'stouffville';
UPDATE cities SET latitude = 44.1009, longitude = -79.1143 WHERE slug = 'uxbridge';
UPDATE cities SET latitude = 44.3091, longitude = -78.3197 WHERE slug = 'peterborough';
UPDATE cities SET latitude = 43.1594, longitude = -79.2469 WHERE slug = 'st-catharines';
UPDATE cities SET latitude = 43.0896, longitude = -79.0849 WHERE slug = 'niagara-falls';
UPDATE cities SET latitude = 42.9849, longitude = -81.2453 WHERE slug = 'london';
UPDATE cities SET latitude = 42.3149, longitude = -83.0364 WHERE slug = 'windsor';
UPDATE cities SET latitude = 43.4516, longitude = -80.4925 WHERE slug = 'kitchener-waterloo';

-- Backfill vendor coordinates from their city
UPDATE vendors v
SET latitude = c.latitude, longitude = c.longitude
FROM cities c
WHERE v.city_id = c.id
AND v.latitude IS NULL
AND c.latitude IS NOT NULL;

-- Create Haversine distance function
CREATE OR REPLACE FUNCTION vendors_near(
  user_lat DECIMAL,
  user_lng DECIMAL,
  radius_km DECIMAL DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  name TEXT,
  email TEXT,
  phone TEXT,
  category_id UUID,
  city_id UUID,
  description TEXT,
  website TEXT,
  instagram TEXT,
  portfolio_images TEXT[],
  tier TEXT,
  is_verified BOOLEAN,
  is_featured BOOLEAN,
  is_active BOOLEAN,
  latitude DECIMAL,
  longitude DECIMAL,
  address TEXT,
  created_at TIMESTAMPTZ,
  distance_km DECIMAL
)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    v.id, v.slug, v.name, v.email, v.phone,
    v.category_id, v.city_id, v.description,
    v.website, v.instagram, v.portfolio_images,
    v.tier, v.is_verified, v.is_featured, v.is_active,
    v.latitude, v.longitude, v.address, v.created_at,
    ROUND(
      (6371 * ACOS(
        LEAST(1.0, COS(RADIANS(user_lat)) * COS(RADIANS(COALESCE(v.latitude, c.latitude)))
        * COS(RADIANS(COALESCE(v.longitude, c.longitude)) - RADIANS(user_lng))
        + SIN(RADIANS(user_lat)) * SIN(RADIANS(COALESCE(v.latitude, c.latitude))))
      ))::numeric, 1
    ) AS distance_km
  FROM vendors v
  LEFT JOIN cities c ON v.city_id = c.id
  WHERE v.is_active = true
    AND COALESCE(v.latitude, c.latitude) IS NOT NULL
    AND 6371 * ACOS(
      LEAST(1.0, COS(RADIANS(user_lat)) * COS(RADIANS(COALESCE(v.latitude, c.latitude)))
      * COS(RADIANS(COALESCE(v.longitude, c.longitude)) - RADIANS(user_lng))
      + SIN(RADIANS(user_lat)) * SIN(RADIANS(COALESCE(v.latitude, c.latitude))))
    ) <= radius_km
  ORDER BY distance_km ASC;
$$;
