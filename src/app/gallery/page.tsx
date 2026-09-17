import { Suspense } from "react";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import GalleryFilters from "@/components/gallery/GalleryFilters";
import { Design } from "@/types/database.types";
import { designService } from "@/services/designService";

import { Metadata } from "next";

export const revalidate = 300; // Cache gallery index for 5 minutes

import Link from "next/link";

type Props = {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
    const searchParams = await props.searchParams;
    const page = typeof searchParams?.page === 'string' ? parseInt(searchParams.page, 10) : 1;
    const currentPage = isNaN(page) || page < 1 ? 1 : page;
    
    const canonicalBase = "https://tattoosmap.com/gallery";
    const canonicalUrl = currentPage > 1 ? `${canonicalBase}?page=${currentPage}` : canonicalBase;

    return {
        title: `Tattoo Design Gallery ${currentPage > 1 ? `— Page ${currentPage}` : ''} | TattoosMap`,
        description: "Browse thousands of curated tattoo designs by style, meaning, and placement. Each design includes symbolism guides, aging predictions, and artist recommendations.",
        alternates: {
            canonical: canonicalUrl
        },
        openGraph: {
            title: `Tattoo Design Gallery ${currentPage > 1 ? `— Page ${currentPage}` : ''} | Browse by Style, Meaning & Placement | TattoosMap`,
            description: "Browse thousands of curated tattoo designs by style, meaning, and placement. Each design includes symbolism guides, aging predictions, and artist recommendations.",
            url: canonicalUrl,
            type: "website",
            images: [
                {
                    url: 'https://tattoosmap.com/brand-logo.png',
                    width: 1200,
                    height: 630,
                    alt: 'TattoosMap Tattoo Design Gallery',
                }
            ]
        },
        twitter: {
            title: `Tattoo Design Gallery ${currentPage > 1 ? `— Page ${currentPage}` : ''} | Browse by Style, Meaning & Placement | TattoosMap`,
            description: "Browse thousands of curated tattoo designs by style, meaning, and placement. Each design includes symbolism guides, aging predictions, and artist recommendations.",
            images: [
                {
                    url: 'https://tattoosmap.com/brand-logo.png',
                    width: 1200,
                    height: 630,
                    alt: 'TattoosMap Tattoo Design Gallery',
                }
            ]
        }
    };
}

export default async function GalleryIndex(props: Props) {
    const searchParams = await props.searchParams;

    // Parse Search Params
    const styleParam = typeof searchParams?.style === 'string' ? searchParams.style : undefined;
    const bodyPartParam = typeof searchParams?.body_part === 'string' ? searchParams.body_part : undefined;
    const genderParam = typeof searchParams?.gender === 'string' ? searchParams.gender : undefined;
    const sortParam = typeof searchParams?.sort === 'string' ? searchParams.sort : 'recommended';
    const qParam = typeof searchParams?.q === 'string' ? searchParams.q : undefined;
    const pageParam = typeof searchParams?.page === 'string' ? parseInt(searchParams.page, 10) : 1;
    const pageNumber = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

    // Fetch Live Designs matching API filtering exactly
    let validDesigns = await designService.getDesigns({ 
        limit: 24,
        page: pageNumber,
        style: styleParam,
        placement: bodyPartParam,
        gender: genderParam,
        sort: sortParam
    });

    if (qParam) {
        // Quick fallback for text search if provided
        validDesigns = validDesigns.filter(d => {
            const indexBuffer = `${d.title} ${d.artist_name} ${d.style.join(" ")} ${d.body_part.join(" ")} ${d.tags?.join(" ")}`.toLowerCase();
            return indexBuffer.includes(qParam.toLowerCase());
        });
    }

    // Server-only recommendation slotting for first page
    if (sortParam === 'recommended') {
        validDesigns = designService.getRecommendedDesigns(validDesigns);
    }

        const limit = 24;
    const hasNextPage = validDesigns.length === limit;
    
    const buildPageUrl = (targetPage: number) => {
        const params = new URLSearchParams();
        if (styleParam) params.set("style", styleParam);
        if (bodyPartParam) params.set("body_part", bodyPartParam);
        if (genderParam) params.set("gender", genderParam);
        if (sortParam && sortParam !== 'recommended') params.set("sort", sortParam);
        if (qParam) params.set("q", qParam);
        if (targetPage > 1) params.set("page", targetPage.toString());
        
        const qs = params.toString();
        return qs ? `/gallery?${qs}` : `/gallery`;
    };

    const prevPageUrl = pageNumber > 1 ? buildPageUrl(pageNumber - 1) : null;
    const nextPageUrl = hasNextPage ? buildPageUrl(pageNumber + 1) : null;

    return (
        <div className="w-full bg-white pb-32">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "CollectionPage",
                        "name": "Tattoo Design Gallery | Browse by Style, Meaning & Placement | TattoosMap",
                        "description": "Browse thousands of curated tattoo designs by style, meaning, and placement. Each design includes symbolism guides, aging predictions, and artist recommendations.",
                        "url": "https://tattoosmap.com/gallery",
                        "provider": { "@type": "Organization", "name": "TattoosMap" }
                    })
                }}
            />
            <h1 className="sr-only">
                Tattoo Design Gallery — Browse Thousands of Curated Tattoo Designs
            </h1>
            <Suspense fallback={<div className="h-[73px] w-full border-b border-gray-light bg-white" />}>
                <GalleryFilters />
            </Suspense>

            {/* Gallery Grid (CSS Masonry) */}
            <main className="max-w-[1280px] mx-auto px-4 md:px-6 pt-12">
                {validDesigns.length > 0 ? (
                    <GalleryGrid 
                        initialDesigns={validDesigns}
                        initialPage={pageNumber} 
                        filters={{
                            style: styleParam,
                            bodyPart: bodyPartParam,
                            gender: genderParam,
                            sort: sortParam
                        }}
                    />
                ) : (
                    <div className="w-full py-24 flex flex-col items-center justify-center text-center">
                        <p className="text-[18px] text-black font-display mb-2">No designs found.</p>
                        <p className="text-[14px] text-gray-mid max-w-[400px]">We couldn&apos;t find any tattoos matching those filters. Try adjusting or clearing your selection.</p>
                    </div>
                )}

                {/* SERVER-BAKED CRAWLER PAGINATION ENGINE */}
                {validDesigns.length > 0 && (
                    <nav aria-label="Gallery Pagination" className="mt-16 pt-8 border-t border-gray-200 flex items-center justify-between">
                        <div>
                            {prevPageUrl ? (
                                <Link href={prevPageUrl} rel="prev" className="px-5 py-2.5 border border-black text-xs font-mono uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                                    ← Previous Page
                                </Link>
                            ) : <span />}
                        </div>
                        
                        <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">
                            Page {pageNumber}
                        </span>

                        <div>
                            {nextPageUrl ? (
                                <Link href={nextPageUrl} rel="next" className="px-5 py-2.5 border border-black text-xs font-mono uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                                    Next Page →
                                </Link>
                            ) : <span />}
                        </div>
                    </nav>
                )}
            </main>
        </div>
    );
}
