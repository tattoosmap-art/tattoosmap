import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const baseUrl = 'https://tattoosmap.com';

  const staticPages = [
    '', '/gallery', '/blog', '/artists', '/products',
    '/clinics', '/tools', '/try-on', '/contact', '/about',
    '/first-tattoo'
  ];

  const clinicCities = [
    'charlotte-nc', 'raleigh-nc', 'phoenix-az', 'nashville-tn',
    'orlando-fl', 'austin-tx', 'denver-co', 'houston-tx', 'miami-fl'
  ];

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  const addUrl = (loc: string, lastmod: string, changefreq: string, priority: string, images?: {loc: string, title: string, caption: string}[]) => {
    xml += `  <url>\n`;
    xml += `    <loc>${loc.replace(/&/g, '&amp;')}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>${changefreq}</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;
    
    if (images && images.length > 0) {
      images.forEach(img => {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${(img.loc || '').replace(/&/g, '&amp;')}</image:loc>\n`;
        if (img.title) xml += `      <image:title>${img.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</image:title>\n`;
        if (img.caption) xml += `      <image:caption>${img.caption.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</image:caption>\n`;
        xml += `    </image:image>\n`;
      });
    }
    
    xml += `  </url>\n`;
  };

  const today = new Date().toISOString().split('T')[0];

  // Add static
  staticPages.forEach(path => {
    addUrl(`${baseUrl}${path}`, today, 'weekly', path === '' ? '1.0' : '0.8');
  });

  // Add clinics & artists
  clinicCities.forEach(city => {
    addUrl(`${baseUrl}/clinics/${city}`, today, 'monthly', '0.7');
    addUrl(`${baseUrl}/artists/${city}`, today, 'monthly', '0.7');
  });

  // Style hub pages
  const styles = ['blackwork', 'fine-line', 'traditional', 'neo-traditional',
    'japanese', 'geometric', 'dotwork', 'watercolor', 'realism', 'illustrative',
    'ornamental', 'tribal'];
  styles.forEach(style => {
    addUrl(`${baseUrl}/style/${style}`, today, 'weekly', '0.7');
  });

  // Placement hub pages
  const placements = ['forearm', 'sleeve', 'ribcage', 'back', 'chest',
    'thigh', 'shoulder', 'wrist', 'ankle', 'neck', 'hand', 'finger'];
  placements.forEach(placement => {
    addUrl(`${baseUrl}/placement/${placement}`, today, 'weekly', '0.7');
  });

  try {
    // Blog posts
    const { data: posts } = await supabase.from('posts').select('slug, created_at').eq('is_published', true);
    if (posts) {
      posts.forEach(post => {
        addUrl(`${baseUrl}/blog/${post.slug}`, (post.created_at ? new Date(post.created_at) : new Date()).toISOString().split('T')[0], 'monthly', '0.8');
      });
    }

    // Designs
    let from = 0;
    const limit = 1000;
    let hasMore = true;
    
    while (hasMore) {
      const { data: designs } = await supabase
        .from('designs')
        .select('slug, uploaded_at, image_url, title, alt_text')
        .eq('is_published', true)
        .range(from, from + limit - 1);
      
      if (designs && designs.length > 0) {
        designs.forEach(design => {
          const imgUrl = design.image_url;
          const title = design.title || design.alt_text || 'Tattoo Design';
          const images = imgUrl ? [{loc: imgUrl, title, caption: design.alt_text || title}] : undefined;
          
          addUrl(
            `${baseUrl}/gallery/${design.slug}`,
            (design.uploaded_at ? new Date(design.uploaded_at) : new Date()).toISOString().split('T')[0],
            'monthly',
            '0.6',
            images
          );
        });
        
        from += limit;
        if (designs.length < limit) hasMore = false;
      } else {
        hasMore = false;
      }
    }

    // Meaning pages
    let allMeanings: any[] = [];
    let mFrom = 0;
    let mHasMore = true;
    
    while (mHasMore) {
      const { data: meanings } = await supabase.from('designs').select('subject').eq('is_published', true).range(mFrom, mFrom + limit - 1);
      if (meanings && meanings.length > 0) {
        allMeanings = [...allMeanings, ...meanings];
        mFrom += limit;
        if (meanings.length < limit) mHasMore = false;
      } else {
        mHasMore = false;
      }
    }

    if (allMeanings.length > 0) {
      const keywords = new Set<string>();
      allMeanings.forEach(d => {
        if (d.subject) {
          const slug = d.subject.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-tattoo.*$/, '-tattoo');
          if (slug.includes('tattoo')) keywords.add(slug);
        }
      });
      Array.from(keywords).forEach(kw => {
        addUrl(`${baseUrl}/meaning/${kw}`, today, 'weekly', '0.7');
      });
    }

  } catch (error) {
    console.error('Sitemap DB error:', error);
  }

  xml += `</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400'
    },
  });
}
