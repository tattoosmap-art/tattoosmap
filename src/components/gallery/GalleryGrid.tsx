"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Design } from "@/types/database.types";
import { blurhashToDataURL } from "@/lib/blurhash";
import { Bookmark, Loader2 } from "lucide-react";
import { useModal } from "@/context/ModalContext";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthContext";
import { toggleDefaultSave, checkIsSaved } from "@/actions/collections";
import { useRouter } from "next/navigation";
import Masonry from "react-masonry-css";

const ITEMS_PER_PAGE = 16;
const ITEMS_TO_LOAD = 12;

export default function GalleryGrid({ initialDesigns }: { initialDesigns: Design[] }) {
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
    const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
    const { user } = useAuth();
    const { openLoginModal } = useModal();
    const { showToast } = useToast();
    const router = useRouter();
    const loaderRef = useRef<HTMLDivElement>(null);

    const designs = initialDesigns.slice(0, visibleCount);
    const hasMore = visibleCount < initialDesigns.length;

    // Load saved designs for current visible designs on change/mount/login
    useEffect(() => {
        if (!user || designs.length === 0) {
            if (!user) setSavedIds(new Set());
            return;
        }

        let cancelled = false;
        // Find designs whose saved status is not checked yet
        const uncheckedIds = designs
            .map(d => d.id)
            .filter(id => !savedIds.has(id));

        if (uncheckedIds.length === 0) return;

        Promise.all(uncheckedIds.map(id => checkIsSaved(id))).then(results => {
            if (cancelled) return;
            setSavedIds(prev => {
                const next = new Set(prev);
                results.forEach((res, i) => {
                    if (res.isSaved) next.add(uncheckedIds[i]);
                });
                return next;
            });
        });

        return () => { cancelled = true; };
    }, [user, visibleCount, initialDesigns]);

    // Intersection Observer to implement auto-loading infinite scroll
    useEffect(() => {
        if (!hasMore) return;

        const observer = new IntersectionObserver((entries) => {
            const first = entries[0];
            if (first.isIntersecting) {
                setVisibleCount(prev => Math.min(prev + ITEMS_TO_LOAD, initialDesigns.length));
            }
        }, { threshold: 0.1, rootMargin: "200px" });

        const currentLoader = loaderRef.current;
        if (currentLoader) {
            observer.observe(currentLoader);
        }

        return () => {
            if (currentLoader) {
                observer.unobserve(currentLoader);
            }
        };
    }, [hasMore, initialDesigns.length]);

    // Reset visible count when filters/initial designs change
    useEffect(() => {
        setVisibleCount(ITEMS_PER_PAGE);
    }, [initialDesigns]);

    const breakpointColumnsObj = {
        default: 4,
        1024: 3,
        768: 2,
        640: 2
    };

    const handleSave = async (e: React.MouseEvent, designId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            openLoginModal();
            return;
        }

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

            {/* Gallery Footer & Loading Trigger */}
            <div 
                ref={loaderRef} 
                className="h-32 w-full flex flex-col items-center justify-center mt-12 border-t border-gray-light"
            >
                {hasMore ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-brand-red" />
                        <span className="text-[10px] text-gray-mid font-mono uppercase tracking-[0.2em] animate-pulse">Loading more designs...</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[12px] text-gray-mid font-mono uppercase tracking-[0.15em]">End of gallery</span>
                        <span className="text-[10px] text-gray-400 font-mono">Showing all {initialDesigns.length} designs</span>
                    </div>
                )}
            </div>
        </>
    );
}
