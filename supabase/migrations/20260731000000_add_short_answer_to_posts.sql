-- Add short_answer column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS short_answer TEXT;
