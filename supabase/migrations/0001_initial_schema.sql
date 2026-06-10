-- Supabase Schema for TattoosMap

-- Authors Table
CREATE TABLE authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT
);

-- Posts Table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  body_content TEXT,         -- MDX or rich text
  cover_image_url TEXT,
  cover_image_alt TEXT,
  author_id UUID REFERENCES authors(id),
  category TEXT,
  tags TEXT[],
  published_at TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT false,
  read_time_minutes INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Designs Table (Gallery)
CREATE TABLE designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  image_url TEXT NOT NULL,         -- original high-res URL
  image_blurhash TEXT,             -- BlurHash string for placeholder
  image_width INT,
  image_height INT,
  alt_text TEXT,
  style TEXT[],                    -- e.g. ['blackwork', 'geometric']
  body_part TEXT[],
  size TEXT,
  artist_name TEXT,
  artist_instagram TEXT,
  tags TEXT[],
  save_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Saves (Assuming auth.users exists in Supabase by default)
CREATE TABLE user_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- normally REFERENCES auth.users(id), leaving loose for mock
  design_id UUID REFERENCES designs(id),
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, design_id)
);

-- Trending Logic (Popularity = save_count * 2 + view_count)
CREATE OR REPLACE FUNCTION get_trending_designs()
RETURNS SETOF designs AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM designs
  WHERE is_published = true
  ORDER BY (save_count * 2.0) + view_count DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql STABLE;
