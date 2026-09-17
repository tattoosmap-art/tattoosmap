import { notFound } from "next/navigation";
import { designService } from "@/services/designService";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const revalidate = 3600; // Cache style hubs for 1 hour

type Props = {
    params: Promise<{ slug: string }>;
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

function formatSlugToTitle(slug: string): string {
    return slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export async function generateMetadata(props: Props): Promise<Metadata> {
    const { slug } = await props.params;
    const searchParams = await props.searchParams;
    const page = typeof searchParams?.page === 'string' ? parseInt(searchParams.page, 10) : 1;
    const currentPage = isNaN(page) || page < 1 ? 1 : page;

    const styleName = formatSlugToTitle(slug);
    const canonicalBase = `https://tattoosmap.com/style/${slug}`;
    const canonicalUrl = currentPage > 1 ? `${canonicalBase}?page=${currentPage}` : canonicalBase;

    return {
        title: `${styleName} Tattoos ${currentPage > 1 ? `— Page ${currentPage}` : '— 2026 Design Guide & Inspiration'} | TattoosMap`,
        description: `Explore top-rated ${styleName} tattoo designs. Complete with aging predictions, stencil previews, and placement guides.`,
        alternates: { canonical: canonicalUrl },
        openGraph: {
            title: `${styleName} Tattoos — Design Ideas & Gallery`,
            description: `Browse curated ${styleName} tattoo designs with expert placement advice.`,
            url: canonicalUrl,
            type: "website",
            images: [
                {
                    url: 'https://tattoosmap.com/brand-logo.png',
                    width: 1200,
                    height: 630,
                    alt: `${styleName} Tattoo Designs on TattoosMap`,
                }
            ]
        },
        twitter: {
            title: `${styleName} Tattoos — Design Ideas & Gallery`,
            description: `Browse curated ${styleName} tattoo designs with expert placement advice.`,
            images: [
                {
                    url: 'https://tattoosmap.com/brand-logo.png',
                    width: 1200,
                    height: 630,
                    alt: `${styleName} Tattoo Designs on TattoosMap`,
                }
            ]
        }
    };
}

export default async function StyleHubPage(props: Props) {
    const { slug } = await props.params;
    const searchParams = await props.searchParams;
    
    const styleName = formatSlugToTitle(slug);
    const pageParam = typeof searchParams?.page === 'string' ? parseInt(searchParams.page, 10) : 1;
    const pageNumber = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const limit = 24;

    const designs = await designService.getDesigns({
        limit,
        page: pageNumber,
        style: slug,
        sort: 'recommended'
    });

    if (!designs || designs.length === 0 && pageNumber === 1) {
        notFound();
    }

    const hasNextPage = designs.length === limit;
    
    const buildPageUrl = (targetPage: number) => {
        const params = new URLSearchParams();
        if (targetPage > 1) params.set("page", targetPage.toString());
        const qs = params.toString();
        return qs ? `/style/${slug}?${qs}` : `/style/${slug}`;
    };

    const prevPageUrl = pageNumber > 1 ? buildPageUrl(pageNumber - 1) : null;
    const nextPageUrl = hasNextPage ? buildPageUrl(pageNumber + 1) : null;

    const hubSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `${styleName} Tattoo Designs & Meaning Guide`,
        "url": `https://tattoosmap.com/style/${slug}`,
        "description": `Comprehensive showcase of ${styleName} tattoos featuring placement maps and design stencils.`
    };

    return (
        <div className="w-full bg-white pb-32">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(hubSchema) }}
            />
            
            <header className="max-w-[1280px] mx-auto px-4 md:px-6 pt-12 pb-8 border-b border-neutral-200">
                <nav aria-label="Breadcrumb" className="mb-4">
                    <ol className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                        <li><Link href="/gallery" className="hover:text-black">Gallery</Link></li>
                        <li>/</li>
                        <li className="text-black font-semibold">{styleName} Tattoos</li>
                    </ol>
                </nav>
                <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tight text-black mb-4">
                    {styleName} Tattoos
                </h1>
                <p className="text-sm md:text-base text-neutral-600 max-w-3xl leading-relaxed font-sans">
                    Browse our curated index of {styleName.toLowerCase()} tattoo designs. Each artwork is evaluated for line longevity, aging stability, and body placement aesthetics.
                </p>
            </header>

            <main className="max-w-[1280px] mx-auto px-4 md:px-6 pt-12">
                {designs.length > 0 ? (
                    <GalleryGrid 
                        initialDesigns={designs}
                        initialPage={pageNumber}
                        filters={{ style: slug }}
                    />
                ) : (
                    <div className="w-full py-24 flex flex-col items-center justify-center text-center">
                        <p className="text-[18px] text-black font-display mb-2">No designs found.</p>
                        <p className="text-[14px] text-gray-mid max-w-[400px]">We couldn&apos;t find any more {styleName.toLowerCase()} tattoos.</p>
                    </div>
                )}

                {/* SERVER-BAKED CRAWLER PAGINATION ENGINE */}
                {designs.length > 0 && (
                    <nav aria-label="Style Hub Pagination" className="mt-16 pt-8 border-t border-gray-200 flex items-center justify-between">
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
