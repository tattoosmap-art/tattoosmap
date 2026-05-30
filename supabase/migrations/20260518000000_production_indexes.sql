-- 1. Designs Table Indexes
-- Speeds up public design lookups by slug (e.g., in gallery details)
CREATE INDEX IF NOT EXISTS idx_designs_published_slug 
  ON designs (is_published, slug);

-- Speeds up latest-first paginated gallery queries
CREATE INDEX IF NOT EXISTS idx_designs_published_uploaded 
  ON designs (is_published, uploaded_at DESC);

-- Speeds up keyword searches and taxonomic filtering on subjects
CREATE INDEX IF NOT EXISTS idx_designs_subject 
  ON designs (subject) WHERE is_published = true;


-- 2. Posts Table Indexes
-- Speeds up public blog post lookups by slug
CREATE INDEX IF NOT EXISTS idx_posts_published_slug 
  ON posts (is_published, slug);

-- Ensure unique constraint check is indexed
CREATE INDEX IF NOT EXISTS idx_posts_slug 
  ON posts (slug);

-- Speeds up landing page and blog index feeds (latest first)
CREATE INDEX IF NOT EXISTS idx_posts_published_created 
  ON posts (is_published, published_at DESC);

-- Speeds up category-specific post filtering (e.g., 'Aftercare')
CREATE INDEX IF NOT EXISTS idx_posts_category 
  ON posts (category) WHERE is_published = true;

-- Speeds up template/intent filtering (e.g., visual step guide vs standard post)
CREATE INDEX IF NOT EXISTS idx_posts_intent 
  ON posts (post_intent) WHERE is_published = true;
