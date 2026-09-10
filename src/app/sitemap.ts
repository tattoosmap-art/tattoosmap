import { MetadataRoute } from 'next';
import { getSupabaseAnon } from '@/lib/supabase-anon';

export async function generateSitemaps() {
    const supabase = getSupabaseAnon();
    const { count } = await supabase
        .from('designs')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);
        
    const totalDesigns = count || 0;
    const chunkSize = 5000;
    const chunks = Math.ceil(totalDesigns / chunkSize);
    
    if (chunks === 0) return [{ id: 0 }];
    
    return Array.from({ length: chunks }, (_, i) => ({ id: i }));
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://tattoosmap.com'; // In production this would be an env var NEXT_PUBLIC_SITE_URL
    const supabase = getSupabaseAnon();

    const routes: MetadataRoute.Sitemap = [];

    // Chunk 0 includes all static routes, blog posts, and taxonomy pages
    if (id === 0) {
        const staticRoutes = [
            { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 },
            { url: `${baseUrl}/first-tattoo`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
            { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
            { url: `${baseUrl}/gallery`, lastModified: new Date(), changeFrequency: 'hourly' as const, priority: 0.9 },
            { url: `${baseUrl}/artists`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
            { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
            { url: `${baseUrl}/try-on`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
            { url: `${baseUrl}/tools`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
            { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.5 },
            { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
        ];
        routes.push(...staticRoutes);

        // Fetch live posts
        const { data: posts } = await supabase.from('posts').select('slug, published_at').eq('is_published', true);
        if (posts) {
            routes.push(...posts.map((post) => ({
                url: `${baseUrl}/blog/${post.slug}`,
                lastModified: new Date(post.published_at || new Date()),
                changeFrequency: 'monthly' as const,
                priority: 0.8,
            })));
        }

        const KEYWORDS = [
          "medusa-tattoo", "semicolon-tattoo", "butterfly-tattoo", "lotus-tattoo", "neo-traditional-tattoo", "gaara-tattoo",
          "icarus-tattoo", "memento-mori-tattoo", "snake-tattoo", "star-tattoo", "dragon-tattoo", "lion-tattoo",
          "skull-tattoo", "spider-tattoo", "sunflower-tattoo", "hand-tattoos", "forearm-tattoos", "sternum-tattoo",
          "neck-tattoos", "chest-tattoos", "spine-tattoos", "arm-tattoos", "sleeve-tattoos", "thigh-tattoos",
          "koi-fish-tattoo", "watercolor-tattoo", "eagle-tattoo", "sacred-heart-tattoo", "berserk-tattoo", "compass-tattoo",
          "owl-tattoo", "scorpion-tattoo", "patchwork-tattoos", "moth-tattoo", "444-tattoo", "angel-tattoo",
          "oni-mask-tattoo", "virgin-mary-tattoo", "ouroboros-tattoo", "raven-tattoo", "finger-tattoos", "shoulder-tattoos",
          "back-tattoos", "leg-tattoos", "cross-tattoo", "bear-tattoo", "crow-tattoo", "daisy-tattoo",
          "elephant-tattoo", "feather-tattoo", "lightning-tattoo", "rose-tattoo", "santa-muerte-tattoo", "sea-turtle-tattoo",
          "sword-tattoo", "yakuza-tattoos", "viking-tattoos", "hummingbird-tattoo", "dragonfly-tattoo", "shark-tattoo",
          "barbed-wire-tattoo", "jesus-tattoo", "phoenix-tattoo", "wolf-tattoo", "tiger-tattoo", "mandala-tattoo",
          "geometric-tattoo", "blackwork-tattoo", "fine-line-tattoo", "traditional-tattoo", "japanese-tattoo", "tribal-tattoo",
          "realism-tattoo", "anchor-tattoo", "moon-tattoo", "sun-tattoo", "heart-tattoo", "infinity-tattoo",
          "tree-tattoo", "arrow-tattoo", "clock-tattoo", "peony-tattoo", "cherry-blossom-tattoo", "fox-tattoo",
          "cat-tattoo", "octopus-tattoo", "samurai-tattoo", "wrist-tattoos", "ankle-tattoos", "hip-tattoos",
          "behind-ear-tattoos", "calf-tattoos", "half-sleeve-tattoo", "sister-tattoos", "couple-tattoos", "mother-son-tattoos"
        ];
        routes.push(...KEYWORDS.map(keyword => ({
            url: `${baseUrl}/meaning/${keyword}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        })));

        const cities = ['charlotte-nc', 'raleigh-nc', 'phoenix-az', 'nashville-tn', 'orlando-fl', 'austin-tx', 'denver-co', 'houston-tx', 'miami-fl'];
        routes.push({ url: `${baseUrl}/clinics`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.9 });
        routes.push(...cities.map(city => ({ url: `${baseUrl}/clinics/${city}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 })));
        routes.push(...cities.map(city => ({ url: `${baseUrl}/artists/${city}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 })));
    }

    // Every chunk fetches its specific batch of 5000 designs
    const limit = 5000;
    const offset = id * limit;

    const { data: designs } = await supabase
        .from('designs')
        .select('id, slug, updated_at')
        .eq('is_published', true)
        .order('published_at', { ascending: false }) // Ensures consistent ordering for pagination
        .range(offset, offset + limit - 1);

    if (designs) {
        routes.push(...designs.map((design) => ({
            url: `${baseUrl}/gallery/${design.slug || design.id}`,
            lastModified: new Date(design.updated_at || new Date()),
            changeFrequency: 'yearly' as const,
            priority: 0.7,
        })));
    }

    return routes;
}
