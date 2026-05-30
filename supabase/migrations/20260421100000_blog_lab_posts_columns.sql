-- Add missing SEO and administrative columns to the posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS focus_keyword TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS schema_type TEXT DEFAULT 'Article';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS related_designs JSONB DEFAULT '[]'::jsonb;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS related_products JSONB DEFAULT '[]'::jsonb;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
