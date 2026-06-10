ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to designs" ON public.designs;
DROP POLICY IF EXISTS "Allow public read access to posts" ON public.posts;
DROP POLICY IF EXISTS "Allow public read access to categories" ON public.categories;

CREATE POLICY "Allow public read access to designs" ON public.designs
    FOR SELECT
    USING (is_published = true);

CREATE POLICY "Allow public read access to posts" ON public.posts
    FOR SELECT
    USING (is_published = true);

CREATE POLICY "Allow public read access to categories" ON public.categories
    FOR SELECT
    USING (true);
