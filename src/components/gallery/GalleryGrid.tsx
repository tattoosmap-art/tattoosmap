"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Design } from "@/types/database.types";
import { blurhashToDataURL } from "@/lib/blurhash";
import { Bookmark, Loader2 } from "lucide-react";
import { useModal } from "@/context/ModalContext";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthContext";
import { toggleDefaultSave, getSavedDesignIds } from "@/actions/collections";
import { useRouter } from "next/navigation";
import Masonry from "react-masonry-css";

export default function GalleryGrid({ initialDesigns }: { initialDesigns: Design[] }) {
    const [designs, setDesigns] = useState<Design[]>(initialDesigns);

    // Map of designId -> saved state (tri-state: undefined = not yet loaded)
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
    // Track which buttons are mid-request so we can show a spinner
    const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
    const { user } = useAuth();
    const { openLoginModal } = useModal();
    const { showToast } = useToast();
    const router = useRouter();

    // Load the user's saved designs from the DB on mount / login
    useEffect(() => {
        if (!user) {
            setSavedIds(new Set());
            return;
        }

        // Fetch all saved IDs for the user
        let cancelled = false;

        getSavedDesignIds().then(res => {
            if (cancelled) return;
            setSavedIds(new Set(res.data));
        });

        return () => { cancelled = true; };
    }, [user, initialDesigns]);

    const breakpointColumnsObj = {
        default: 4,
        1024: 3,
        768: 2,
        640: 2
    };

    // Keep designs in sync with initialDesigns when filters are applied
    useEffect(() => {
        setDesigns(initialDesigns);
    }, [initialDesigns]);

    const handleSave = async (e: React.MouseEvent, designId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            openLoginModal();
            return;
        }

        // Optimistic update
        const wasSaved = savedIds.has(designId);
        setSavedIds(prev => {
            const next = new Set(prev);
            wasSaved ? next.delete(designId) : next.add(designId);
            return next;
        });
        setPendingIds(prev => new Set(prev).add(designId));

        const res = await toggleDefaultSave(designId);
        setPendingIds(prev => {
            const next = new Set(prev);
            next.delete(designId);
            return next;
        });

        if (res.error) {
            // Rollback on error
            setSavedIds(prev => {
                const next = new Set(prev);
                wasSaved ? next.add(designId) : next.delete(designId);
                return next;
            });
            showToast("Could not save — please try again");
        } else {
            showToast(res.isSaved ? "SAVED TO ARCHIVE" : "REMOVED FROM ARCHIVE");
        }
    };

    return (
        <>
            <Masonry
                breakpointCols={breakpointColumnsObj}
                className="design-masonry-grid"
                columnClassName="design-masonry-column"
            >
                {designs.map((design, index) => {
                    const blurDataUrl = blurhashToDataURL(design.image_blurhash);
                    const isSaved = savedIds.has(design.id);

                    return (
                        <div
                            key={design.id}
                            className="break-inside-avoid-column mb-6 group relative border border-gray-light rounded-none overflow-hidden bg-off-white will-change-transform transform-gpu animate-fade-in-up active:scale-[0.97] transition-all duration-300 ease-out"
                            style={{ animationDelay: `${(index % 4) * 0.1}s` }}
                            onMouseEnter={() => router.prefetch(`/gallery/${design.slug}`)}
                            onTouchStart={() => router.prefetch(`/gallery/${design.slug}`)}
                        >
                            <Link href={`/gallery/${design.slug}`} className="block" scroll={false} prefetch={false}>
                                <Image
                                    src={design.image_shaded_url || design.image_url}
                                    alt={design.alt_text}
                                    width={design.image_width}
                                    height={design.image_height}
                                    className="w-full h-auto"
                                    placeholder="blur"
                                    blurDataURL={blurDataUrl}
                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                    loading={index < 6 ? undefined : "lazy"}
                                    priority={index < 6}
                                />

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-white bg-black/50 px-4 py-2 border border-white/20">
                                        View Design
                                    </span>
                                </div>
                            </Link>

                            {/* Bookmark Action */}
                            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                    onClick={(e) => handleSave(e, design.id)}
                                    disabled={pendingIds.has(design.id)}
                                    className={`p-2 backdrop-blur-md border transition-all disabled:opacity-70 ${
                                        isSaved 
                                            ? 'bg-brand-red border-brand-red text-white' 
                                            : 'bg-white/40 border-white/40 text-black hover:bg-white hover:text-brand-red'
                                    }`}
                                    aria-label={isSaved ? "Unsave" : "Save"}
                                >
                                    {pendingIds.has(design.id)
                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                        : <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                                    }
                                </button>
                            </div>
                        </div>
                    );
                })}
            </Masonry>

            {/* Gallery Footer */}
            <div className="h-20 w-full flex items-center justify-center mt-12 border-t border-gray-light">
                <span className="text-[12px] text-gray-mid font-mono uppercase tracking-[0.1em]">End of gallery</span>
            </div>
        </>
    );
}
