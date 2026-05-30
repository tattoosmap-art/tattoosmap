-- Ensure the mockup image columns exist
ALTER TABLE designs ADD COLUMN IF NOT EXISTS image_fresh_url TEXT DEFAULT NULL;
ALTER TABLE designs ADD COLUMN IF NOT EXISTS image_healed_url TEXT DEFAULT NULL;
