-- Add dedicated SEO fields to the designs table for the Meaning cluster strategy
ALTER TABLE designs ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE designs ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE designs ADD COLUMN IF NOT EXISTS focus_keyword TEXT;
