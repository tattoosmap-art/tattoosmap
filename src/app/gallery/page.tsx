import { Suspense } from "react";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import GalleryFilters from "@/components/gallery/GalleryFilters";
import { designService } from "@/services/designService";
import { getSupabaseAnon } from "@/lib/supabase-anon";
import Link from "next/link";

export const revalidate = 300; // Cache gallery index for 5 minutes

export default async function GalleryIndex(props: {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const searchParams = await props.searchParams;

    // Parse Search Params
    const styleParam = typeof searchParams?.style === 'string' ? searchParams.style : undefined;
    const bodyPartParam = typeof searchParams?.body_part === 'string' ? searchParams.body_part : undefined;
    const genderParam = typeof searchParams?.gender === 'string' ? searchParams.gender : undefined;
    const sortParam = typeof searchParams?.sort === 'string' ? searchParams.sort : 'recent';
    const pageParam = typeof searchParams?.page === 'string' ? parseInt(searchParams.page, 10) : 1;
    const page = isNaN(pageParam) ? 1 : pageParam;
    const limit = 24;

    // Fetch Live Designs with Database-level Pagination and Filtering
    const validDesigns = await designService.getDesigns({
        page,
        limit,
        style: styleParam,
        placement: bodyPartParam,
        gender: genderParam,
        sort: sortParam
    });

    // Optional: get total count for "X of Y" display
    let totalDesigns = 0;
    try {
        const supabase = getSupabaseAnon();
        let countQuery = supabase.from('designs').select('*', { count: 'exact', head: true }).eq('is_published', true);
        if (styleParam) countQuery = countQuery.contains('style', [styleParam]);
        if (bodyPartParam) countQuery = countQuery.contains('body_part', [bodyPartParam]);
        if (genderParam) countQuery = countQuery.eq('gender', genderParam);
        
        const { count, error } = await countQuery;
        if (error) {
            console.error('[DATABASE ERROR] Failed to fetch total count from Supabase:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
        } else {
            totalDesigns = count || 0;
        }
    } catch (err: any) {
        console.error('[DATABASE FATAL] Failed to fetch total count:', err);
    }

    const showingX = Math.min(page * limit, totalDesigns);
    const hasMore = showingX < totalDesigns;

    // Build next page URL keeping existing params
    const nextParams = new URLSearchParams();
    if (styleParam) nextParams.set('style', styleParam);
    if (bodyPartParam) nextParams.set('body_part', bodyPartParam);
    if (genderParam) nextParams.set('gender', genderParam);
    if (sortParam) nextParams.set('sort', sortParam);
    nextParams.set('page', (page + 1).toString());
    const nextUrl = `/gallery?${nextParams.toString()}`;

    return (
        <div className="w-full bg-white pb-32">
            <Suspense fallback={<div className="h-[73px] w-full border-b border-gray-light bg-white" />}>
                <GalleryFilters />
            </Suspense>

            <main className="max-w-[1280px] mx-auto px-4 md:px-6 pt-12">
                {validDesigns.length > 0 ? (
                    <>
                        <GalleryGrid initialDesigns={validDesigns} />
                        <div className="flex flex-col items-center justify-center mt-12 space-y-4">
                            <p className="text-sm font-mono text-gray-mid tracking-widest uppercase">
                                SHOWING {showingX} OF {totalDesigns} DESIGNS
                            </p>
                            {hasMore && (
                                <Link 
                                    href={nextUrl} 
                                    className="px-8 py-3 bg-black text-white font-mono text-sm uppercase tracking-widest hover:bg-brand-red transition-colors"
                                >
                                    LOAD MORE DESIGNS
                                </Link>
                            )}
                        </div>
                    </>
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
