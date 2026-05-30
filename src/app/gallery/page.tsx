import { Suspense } from "react";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import GalleryFilters from "@/components/gallery/GalleryFilters";
import { Design } from "@/types/database.types";
import { designService } from "@/services/designService";

export const revalidate = 300; // Cache gallery index for 5 minutes

export default async function GalleryIndex(props: {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const searchParams = await props.searchParams;

    // Fetch Live Designs (Falls back to MOCK_DESIGNS inside service if DB is empty)
    const baseDesigns = await designService.getDesigns();

    // Parse Search Params
    const styleParam = typeof searchParams?.style === 'string' ? searchParams.style.toLowerCase() : null;
    const bodyPartParam = typeof searchParams?.body_part === 'string' ? searchParams.body_part.toLowerCase() : null;
    const genderParam = typeof searchParams?.gender === 'string' ? searchParams.gender.toLowerCase() : null;
    const sortParam = typeof searchParams?.sort === 'string' ? searchParams.sort : 'recommended';
    const qParam = typeof searchParams?.q === 'string' ? searchParams.q.toLowerCase() : null;

    // Filter the returned designs
    let filteredDesigns = [...baseDesigns];

    if (styleParam) {
        filteredDesigns = filteredDesigns.filter(d => 
            d.style.some(s => {
                const normS = s.toLowerCase().replace(/[\s-_]/g, '');
                const normParam = styleParam.toLowerCase().replace(/[\s-_]/g, '');
                return normS === normParam || normS.includes(normParam) || normParam.includes(normS);
            })
        );
    }

    if (bodyPartParam) {
        filteredDesigns = filteredDesigns.filter(d => d.body_part.map(b => b.toLowerCase()).includes(bodyPartParam));
    }

    if (genderParam) {
        filteredDesigns = filteredDesigns.filter(d => {
            const g = d.gender?.toLowerCase() || '';
            if (genderParam === 'male') {
                return g === 'male' || g === 'male-leaning' || g === 'unisex' || g === 'men and women';
            }
            if (genderParam === 'female') {
                return g === 'female' || g === 'female-leaning' || g === 'unisex' || g === 'men and women';
            }
            return g === genderParam;
        });
    }

    if (qParam) {
        filteredDesigns = filteredDesigns.filter(d => {
            const indexBuffer = `${d.title} ${d.artist_name} ${d.style.join(" ")} ${d.body_part.join(" ")} ${d.tags?.join(" ")}`.toLowerCase();
            return indexBuffer.includes(qParam);
        });
    }

    // Sorting logic
    if (sortParam === 'recommended') {
        filteredDesigns = designService.getRecommendedDesigns(filteredDesigns);
    } else if (sortParam === 'saved') {
        filteredDesigns.sort((a, b) => b.save_count - a.save_count);
    } else if (sortParam === 'viewed') {
        filteredDesigns.sort((a, b) => b.view_count - a.view_count);
    }

    // Task 2: Dead Link Shield - Bypassed for instant loading
    const validDesigns = filteredDesigns;

    return (
        <div className="w-full bg-white pb-32">
            <Suspense fallback={<div className="h-[73px] w-full border-b border-gray-light bg-white" />}>
                <GalleryFilters />
            </Suspense>

            {/* Gallery Grid (CSS Masonry) */}
            <main className="max-w-[1280px] mx-auto px-4 md:px-6 pt-12">
                {validDesigns.length > 0 ? (
                    <GalleryGrid initialDesigns={validDesigns} />
                ) : (
                    <div className="w-full py-24 flex flex-col items-center justify-center text-center">
                        <p className="text-[18px] text-black font-display mb-2">No designs found.</p>
                        <p className="text-[14px] text-gray-mid max-w-[400px]">We couldn&apos;t find any tattoos matching those filters. Try adjusting or clearing your selection.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
