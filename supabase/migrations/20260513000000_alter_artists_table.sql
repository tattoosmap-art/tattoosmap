-- Extend the existing artists table with columns required for the editorial card layout
ALTER TABLE artists 
ADD COLUMN IF NOT EXISTS specialty TEXT,
ADD COLUMN IF NOT EXISTS link_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_images TEXT[];

-- Enable Row Level Security
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

-- Allow public read access (admins write via service_role key which bypasses RLS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'artists' AND policyname = 'Allow public read access to artists'
  ) THEN
    EXECUTE 'CREATE POLICY "Allow public read access to artists" ON artists FOR SELECT USING (true)';
  END IF;
END $$;
