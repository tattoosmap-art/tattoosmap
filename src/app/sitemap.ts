import { MetadataRoute } from 'next';
import { supabaseAnon as supabase } from '@/lib/supabase-anon';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://tattoosmap.com'; // In production this would be an env var NEXT_PUBLIC_SITE_URL

    const staticRoutes = [
        {
            url: `${baseUrl}/`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 1,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/gallery`,
            lastModified: new Date(),
            changeFrequency: 'hourly' as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/artists`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/products`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        },
        {
            url: `${baseUrl}/try-on`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        },
        {
            url: `${baseUrl}/tools`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'yearly' as const,
            priority: 0.5,
        },
    ];

    // Fetch live posts from the database dynamically
    const { data: posts } = await supabase
        .from('posts')
        .select('slug, published_at')
        .eq('is_published', true);

    const blogRoutes = (posts || []).map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.published_at || new Date()),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    }));

    // Fetch live designs from the database dynamically
    const { data: designs } = await supabase
        .from('designs')
        .select('id, slug, updated_at')
        .eq('is_published', true);

    const galleryRoutes = (designs || []).map((design) => ({
        url: `${baseUrl}/gallery/${design.slug || design.id}`,
        lastModified: new Date(design.updated_at || new Date()),
        changeFrequency: 'yearly' as const,
        priority: 0.7,
    }));

    const KEYWORDS = [
        "dragon-tattoo", "lotus-tattoo", "snake-tattoo", "rose-tattoo",
        "butterfly-tattoo", "skull-tattoo", "koi-fish-tattoo", "wolf-tattoo",
        "lion-tattoo", "tiger-tattoo", "phoenix-tattoo", "anchor-tattoo",
        "compass-tattoo", "owl-tattoo", "bear-tattoo", "eagle-tattoo",
        "medusa-tattoo", "moon-tattoo", "sun-tattoo", "arrow-tattoo",
        "feather-tattoo", "tree-tattoo", "clock-tattoo", "heart-tattoo",
        "cross-tattoo", "semicolon-tattoo", "infinity-tattoo", "mandala-tattoo"
    ];

    const meaningRoutes = KEYWORDS.map(keyword => ({
        url: `${baseUrl}/meaning/${keyword}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    }));

    return [...staticRoutes, ...blogRoutes, ...galleryRoutes, ...meaningRoutes];
}
