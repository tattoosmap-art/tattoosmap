import { notFound } from "next/navigation";
import { designService } from "@/services/designService";
import { Metadata } from "next";
import { supabaseAnon } from "@/lib/supabase-anon";

// Dynamic Client Component
import DesignDetailClient from "@/components/gallery/DesignDetailClient";
import SimilarDesignsBar from "@/components/gallery/SimilarDesignsBar";

export const revalidate = 600; // Cache gallery detail page for 10 minutes

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  let query = supabaseAnon
    .from('designs')
    .select('subject, style, placement_recommendations, meaning, alt_text, image_url, meta_title, meta_description, slug, speakable_summary')
    .eq('is_published', true);
    
  if (isUuid) {
    query = query.eq('id', id);
  } else {
    query = query.eq('slug', id);
  }

  const { data: design } = await query.single();

  if (!design) {
    return {
      title: 'Design Not Found | TattoosMap',
    };
  }

  const title = design.meta_title ||
    `${design.subject} — Meaning & Symbolism | TattoosMap`;

  let formattedStyle = '';
  if (design.style) {
    try {
      const parsed = typeof design.style === 'string' && design.style.startsWith('[') ? JSON.parse(design.style) : design.style;
      formattedStyle = Array.isArray(parsed) ? parsed.join(', ') : String(parsed);
    } catch {
      formattedStyle = String(design.style);
    }
  }

  const description = design.meta_description ||
    design.speakable_summary ||
    (design.meaning ? `${design.meaning.substring(0, 155).trim()}...` : '') ||
    `Explore this ${formattedStyle ? formattedStyle.toLowerCase() + ' ' : ''}${design.subject?.toLowerCase() || ''} design with pain maps, aging predictions, and cultural meaning on TattoosMap.`;

  const imageUrl = design.image_url || 'https://tattoosmap.com/brand-logo.png';
  const canonicalUrl = `https://tattoosmap.com/gallery/${design.slug || id}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: design.alt_text || `${design.subject} tattoo design`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function DesignPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch full dataset (SSR with Incremental Revalidation)
    const pageData = await designService.getDesignPageData(id);
    const design = pageData.design;

    if (!design) {
        notFound();
    }

    // JSON-LD Artwork Schema
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'VisualArtwork',
      name: `${design.subject || design.title || 'Untitled'} Tattoo Design`,
      description: design.meaning || design.meta_description,
      artform: 'Tattoo',
      artMedium: design.style || 'Ink',
      url: `https://tattoosmap.com/gallery/${design.slug}`,
      image: design.image_url,
      creator: {
        '@type': 'Organization',
        name: 'TattoosMap',
        url: 'https://tattoosmap.com'
      },
      keywords: [
        design.subject,
        design.style,
        'tattoo design',
        'tattoo meaning',
        `${design.subject} tattoo`,
        `${design.subject} tattoo meaning`,
      ].filter(Boolean).join(', ')
    };

    // JSON-LD FAQ Search Schema
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": `What does a ${design.subject || design.title || "fine line"} tattoo mean?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": design.meaning || "The story behind this design is being documented."
                }
            },
            {
                "@type": "Question", 
                "name": `What is the cultural origin of the ${design.subject || design.title || "fine line"} tattoo?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": design.cultural_origin || "This design has roots in modern Western minimalist tattoo culture."
                }
            },
            {
                "@type": "Question",
                "name": `Where is the best placement for a ${design.subject || design.title || "fine line"} tattoo?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": Array.isArray(design.placement_recommendations) && design.placement_recommendations.length > 0
                        ? `The best placements for a ${design.subject || design.title || "fine line"} tattoo are: ${design.placement_recommendations.join(', ')}.`
                        : `Placement recommendations for this design are available on the TattoosMap design page.`
                }
            }
        ]
    };

    return (
        <div className="w-full bg-white pb-32">
            
            {/* SEO Schemas */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            


            {/* MASTER DYNAMIC CLIENT BLOCK (PORTS THE FULL PREMIUM DESIGN LAB STRUCTURE) */}
            <DesignDetailClient 
                design={design} 
                publicCollections={pageData.publicCollections || []}
            />

            {/* ========================================================= */}
            {/* CROSS-SELLING SIMILARITY ENGINE                          */}
            {/* ========================================================= */}
            <div className="border-t border-neutral-200 bg-neutral-50 pt-24 flex flex-col gap-24">
                <section aria-label="Visual Aesthetic Similarity">
                    <div className="max-w-[1280px] mx-auto px-4 md:px-8 mb-10">
                        <div className="flex items-center gap-3 text-black mb-2">
                            <span className="font-mono text-[11px] uppercase font-bold tracking-[0.3em] text-neutral-400">STYLE MATCH</span>
                        </div>
                        <h2 className="font-display text-[32px] tracking-tight uppercase leading-none">More Designs in this Style</h2>
                    </div>
                    <SimilarDesignsBar currentDesignId={design.id} mode="visual" hideHeader={true} />
                </section>

                <section aria-label="Conceptual Similarity" className="pb-32">
                     <div className="max-w-[1280px] mx-auto px-4 md:px-8 mb-10">
                        <div className="flex items-center gap-3 text-black mb-2">
                            <span className="font-mono text-[11px] uppercase font-bold tracking-[0.3em] text-neutral-400">MEANING MATCH</span>
                        </div>
                        <h2 className="font-display text-[32px] tracking-tight uppercase leading-none">More Designs with Similar Meanings</h2>
                    </div>
                    <div className="opacity-90">
                        <SimilarDesignsBar currentDesignId={design.id} mode="conceptual" hideHeader={true} />
                    </div>
                </section>
            </div>

        </div>
    );
}
