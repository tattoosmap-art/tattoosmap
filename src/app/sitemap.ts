import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tattoosmap.com';
  
  // Static pages
  const staticPages = [
    '', '/gallery', '/blog', '/artists', '/products',
    '/clinics', '/tools', '/try-on', '/contact', '/about',
    '/first-tattoo'
  ].map(path => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1.0 : 0.8,
  }));

  // Clinic city pages
  const clinicCities = [
    'charlotte-nc', 'raleigh-nc', 'phoenix-az', 'nashville-tn',
    'orlando-fl', 'austin-tx', 'denver-co', 'houston-tx', 'miami-fl'
  ];
  const clinicPages = clinicCities.map(city => ({
    url: `${baseUrl}/clinics/${city}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Artist city pages
  const artistPages = clinicCities.map(city => ({
    url: `${baseUrl}/artists/${city}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Dynamic pages from database
  let blogPages: MetadataRoute.Sitemap = [];
  let designPages: MetadataRoute.Sitemap = [];
  let meaningPages: MetadataRoute.Sitemap = [];

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Blog posts
    const { data: posts } = await supabase
      .from('posts')
      .select('slug, updated_at')
      .eq('is_published', true);

    if (posts) {
      blogPages = posts.map(post => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }));
    }

    // Designs
    const { data: designs } = await supabase
      .from('designs')
      .select('slug, uploaded_at')
      .eq('is_published', true);

    if (designs) {
      designPages = designs.map(design => ({
        url: `${baseUrl}/gallery/${design.slug}`,
        lastModified: design.uploaded_at ? new Date(design.uploaded_at) : new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
    }

    // Meaning pages
    const { data: meanings } = await supabase
      .from('designs')
      .select('subject')
      .eq('is_published', true);

    if (meanings) {
      const keywords = new Set<string>();
      meanings.forEach(d => {
        if (d.subject) {
          const slug = d.subject.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-tattoo.*$/, '-tattoo');
          if (slug.includes('tattoo')) keywords.add(slug);
        }
      });
      meaningPages = Array.from(keywords).map(kw => ({
        url: `${baseUrl}/meaning/${kw}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }

  } catch (error) {
    console.error('Sitemap database error:', error);
  }

  return [
    ...staticPages,
    ...clinicPages,
    ...artistPages,
    ...blogPages,
    ...designPages,
    ...meaningPages,
  ];
}
