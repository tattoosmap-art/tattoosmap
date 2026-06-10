-- Create artists table FIRST as designs and blog_posts reference it
CREATE TABLE IF NOT EXISTS artists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  bio TEXT,
  instagram_url TEXT,
  portfolio_url TEXT,
  person_schema JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create designs table
CREATE TABLE IF NOT EXISTS designs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  seo_filename TEXT NOT NULL,
  thumbnail_filename TEXT NOT NULL,
  subject TEXT NOT NULL,
  public_category TEXT NOT NULL CHECK (
    public_category IN (
      'nature-botanical',
      'pop-culture-characters',
      'animals-wildlife',
      'celestial-mystical',
      'minimalist-objects'
    )
  ),
  family_internal TEXT,
  mood TEXT,
  elements TEXT[],
  alt_text TEXT NOT NULL,
  speakable_summary TEXT NOT NULL,
  visual_work_schema JSONB,
  speakable_schema JSONB,
  confidence_score DECIMAL(3,2),
  ip_flag BOOLEAN DEFAULT FALSE,
  artist_id UUID REFERENCES artists(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  executive_summary TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES artists(id),
  article_schema JSONB,
  speakable_schema JSONB,
  category TEXT CHECK (
    category IN (
      'care-guides',
      'style-guides',
      'artist-spotlights'
    )
  ),
  related_design_ids UUID[],
  status TEXT DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  hero_image TEXT,
  design_count INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed categories
INSERT INTO categories (slug, label, seo_title, seo_description) VALUES
('nature-botanical', 'Nature & Botanical', 'Fine Line Nature Tattoo Designs | Flowers, Leaves & Botanical', 'Discover premium fine-line nature and botanical tattoo designs featuring flowers, leaves, branches and organic forms.'),
('pop-culture-characters', 'Pop Culture & Characters', 'Fine Line Pop Culture Tattoo Designs | Disney, Anime & Characters', 'Browse fine-line tattoo designs featuring iconic characters from Disney, anime, and popular culture.'),
('animals-wildlife', 'Animals & Wildlife', 'Fine Line Animal Tattoo Designs | Fox, Dog, Wildlife & More', 'Explore delicate fine-line animal and wildlife tattoo designs featuring foxes, dogs, hedgehogs and more.'),
('celestial-mystical', 'Celestial & Mystical', 'Fine Line Celestial Tattoo Designs | Moon, Stars & Zodiac', 'Discover ethereal fine-line celestial tattoo designs featuring moons, stars, and zodiac symbols.'),
('minimalist-objects', 'Minimalist Objects', 'Fine Line Minimalist Object Tattoo Designs | Bells, Bags & More', 'Browse refined fine-line minimalist object tattoo designs featuring everyday objects rendered in delicate detail.')
ON CONFLICT (slug) DO NOTHING;

-- Create Storage Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('designs', 'designs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy allowing pure Select access.
-- Wrapped in a DO block to handle conditional creation
DO $$ 
BEGIN
  -- For brevity we will ensure objects in this bucket are publicly readable. 
  CREATE POLICY "Public Access to Designs" ON storage.objects
  FOR SELECT USING (bucket_id = 'designs');
EXCEPTION WHEN duplicate_object THEN
  -- Policy already exists. Ignore. 
  NULL;
END $$;
