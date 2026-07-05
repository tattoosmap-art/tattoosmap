import { MetadataRoute } from 'next';
import { getSupabaseAnon } from '@/lib/supabase-anon';

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
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        },
    ];

    const supabase = getSupabaseAnon();

    // Fetch live posts from the database dynamically
    const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('slug, published_at')
        .eq('is_published', true);

    if (postsError) {
        console.error('[DATABASE ERROR] Failed to fetch posts for sitemap from Supabase:', {
            message: postsError.message,
            code: postsError.code
        });
    }

    const blogRoutes = (posts || []).map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.published_at || new Date()),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    }));

    // Fetch live designs from the database dynamically
    const { data: designs, error: designsError } = await supabase
        .from('designs')
        .select('id, slug, updated_at')
        .eq('is_published', true);

    if (designsError) {
        console.error('[DATABASE ERROR] Failed to fetch designs for sitemap from Supabase:', {
            message: designsError.message,
            code: designsError.code
        });
    }

    const galleryRoutes = (designs || []).map((design) => ({
        url: `${baseUrl}/gallery/${design.slug || design.id}`,
        lastModified: new Date(design.updated_at || new Date()),
        changeFrequency: 'yearly' as const,
        priority: 0.7,
    }));

    return [...staticRoutes, ...blogRoutes, ...galleryRoutes];
}
