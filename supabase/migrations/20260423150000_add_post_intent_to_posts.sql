-- Add post_intent column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS post_intent TEXT;

-- Update existing rows to a default if necessary (optional)
-- UPDATE posts SET post_intent = 'RECOMMEND AND SELL' WHERE post_intent IS NULL;
