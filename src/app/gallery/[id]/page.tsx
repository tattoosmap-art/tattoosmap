import { notFound } from "next/navigation";
import { designService } from "@/services/designService";
import { Metadata } from "next";

// Dynamic Client Component
import DesignDetailClient from "@/components/gallery/DesignDetailClient";
import SimilarDesignsBar from "@/components/gallery/SimilarDesignsBar";

export const revalidate = 600; // Cache gallery detail page for 10 minutes

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const { design } = await designService.getDesignPageData(id);

    if (!design) return { title: "Design Not Found - Tattoosmap" };

    const subject = design.title || "Untitled";
    
    // Priority: DB SEO Fields > Generation Fallbacks
    const metaTitle = design.meta_title || `${subject} Tattoo — Meaning, Symbolism & Cultural Origin | TattoosMap`;
    const metaDescription = design.meta_description || `${design.meaning ? design.meaning.substring(0, 155) : design.alt_text} Explore ${subject} tattoo designs, placement guides, and artist recommendations on TattoosMap.`.trim();
    const focusKeyword = design.focus_keyword || `${subject} tattoo meaning`;

    return {
        title: metaTitle,
        description: metaDescription,
        keywords: [focusKeyword, ...(design?.style_tags || []), ...(design?.emotion_tags || [])],
        openGraph: {
            title: metaTitle,
            description: metaDescription,
            images: [{ url: design.image_url }]
        }
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
        "@context": "https://schema.org",
        "@type": "VisualArtwork",
        "name": `${design.title || "Untitled"} Fine Line Tattoo Design`,
        "description": `${design.meaning || ""} — ${design.alt_text || ""}`.trim(),
        "artform": "Tattoo Design",
        "artMedium": "Fine Line Ink",
        "genre": "tattoo",
        "keywords": `${design.emotion_tags?.join(', ') || ''}, ${design.style_tags?.join(', ') || ''}, fine line tattoo`,
        "image": design.image_url,
        "interactionStatistic": [
            {
                "@type": "InteractionCounter",
                "interactionType": "https://schema.org/LikeAction",
                "userInteractionCount": design.real_save_count || 0
            }
        ]
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
