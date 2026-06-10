"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { Design } from "@/types/database.types";
import { designService } from "@/services/designService";
import { blurhashToDataURL } from "@/lib/blurhash";
import { useAuth } from "@/context/AuthContext";
import { useModal } from "@/context/ModalContext";
import { useToast } from "@/components/ui/Toast";
import { getSavedDesignIds, toggleSaveDesign } from "@/lib/saves";
import { useRouter } from "next/navigation";

export default function SimilarDesignsBar({ 
    currentDesignId, 
    mode = 'visual', 
    hideHeader = false 
}: { 
    currentDesignId: string; 
    mode?: 'visual' | 'conceptual';
    hideHeader?: boolean;
}) {
    const [designs, setDesigns] = useState<Design[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
    
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreNodeRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();
    const { openLoginModal } = useModal();
    const { showToast } = useToast();
    const router = useRouter();

    const limit = 10;

    // Initial Fetch
    useEffect(() => {
        let isMounted = true;
        const fetchInitial = async () => {
            setLoading(true);
            const initial = await designService.getSimilarDesigns(currentDesignId, limit, 0, mode);
            if (isMounted) {
                setDesigns(initial);
                setHasMore(initial.length === limit);
                setLoading(false);
            }
        };
        fetchInitial();
        return () => { isMounted = false; };
    }, [currentDesignId, mode]);

    // Track Saves
    useEffect(() => {
        if (user) {
            const ids = getSavedDesignIds(user.id);
            setSavedIds(new Set(ids));
        }
    }, [user]);

    // Infinite Scroll Logic
    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;
        setLoading(true);

        const nextBatch = await designService.getSimilarDesigns(currentDesignId, limit, designs.length, mode);
        
        if (nextBatch.length > 0) {
            setDesigns(prev => {
                // Prevent duplicates in case React fires twice
                const existingIds = new Set(prev.map(d => d.id));
                const uniqueNext = nextBatch.filter(d => !existingIds.has(d.id));
                return [...prev, ...uniqueNext];
            });
        }
        
        if (nextBatch.length < limit) {
            setHasMore(false);
        }
        setLoading(false);
    }, [currentDesignId, designs.length, loading, hasMore, mode]);

    // Intersection Observer attached to the sentinel div
    useEffect(() => {
        if (loading) return;
        
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore();
            }
        }, { root: null, rootMargin: '200px', threshold: 0.1 });

        if (loadMoreNodeRef.current) {
            observer.observe(loadMoreNodeRef.current);
        }

        observerRef.current = observer;

        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, [loading, hasMore, loadMore]);

    const handleSave = (e: React.MouseEvent, designId: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            openLoginModal();
            return;
        }

        const nowSaved = toggleSaveDesign(user.id, designId);

        setSavedIds(prev => {
            const next = new Set(prev);
            if (nowSaved) next.add(designId);
            else next.delete(designId);
            return next;
        });

        showToast(nowSaved ? "SAVED TO ARCHIVE" : "REMOVED FROM ARCHIVE");
    };

    if (designs.length === 0 && !loading) return null;

    const renderDesignsList = () => {
        return (
            <div data-lenis-prevent="true" className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 pb-8 -mx-4 px-4 md:mx-0 md:px-0 overscroll-x-contain">
                {designs.map((sim) => {
                    const simBlur = blurhashToDataURL(sim.image_blurhash);
                    const isSaved = savedIds.has(sim.id);

                    return (
                        <div 
                            key={sim.id} 
                            // The w-[80vw] md:w-[280px] ensures the next item 'peeks' in on mobile devices.
                            className="min-w-[80vw] w-[80vw] md:min-w-[280px] md:w-[280px] flex-shrink-0 snap-start group relative border border-gray-light rounded-none overflow-hidden bg-white active:scale-[0.98] transition-transform duration-200"
                        >
                            <Link 
                                href={`/gallery/${sim.id}`} 
                                className="block"
                                scroll={false}
                                prefetch={false}
                                onMouseEnter={() => router.prefetch(`/gallery/${sim.id}`)}
                            >
                                <div className="w-full aspect-[4/5] relative bg-white animate-pulse">
                                    <Image
                                        src={sim.image_url}
                                        alt={sim.alt_text}
                                        fill
                                        className="object-contain p-3 opacity-0 transition-opacity duration-500 rounded-none mix-blend-multiply"
                                        onLoad={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.classList.remove('opacity-0');
                                            target.classList.add('opacity-100');
                                            target.parentElement?.classList.remove('animate-pulse');
                                        }}
                                        placeholder="blur"
                                        blurDataURL={simBlur}
                                        sizes="(max-width: 768px) 80vw, 300px"
                                    />
                                    
                                    {/* Quick-Save Overlay */}
                                    <button
                                        onClick={(e) => handleSave(e, sim.id)}
                                        className={`absolute top-4 right-4 z-10 p-2 bg-transparent transition-all ${isSaved ? 'text-brand-red' : 'text-white hover:text-brand-red drop-shadow-md hover:scale-110'}`}
                                        aria-label={isSaved ? "Unsave" : "Save"}
                                    >
                                        <Bookmark className="w-5 h-5" strokeWidth={1.5} fill={isSaved ? "currentColor" : "none"} />
                                    </button>

                                    {/* Style Tag Label */}
                                    {(() => {
                                         let styleLabel = "";
                                         const rawStyle = sim.style as unknown;
                                         if (Array.isArray(rawStyle) && rawStyle.length > 0) {
                                             styleLabel = rawStyle[0];
                                         } else if (typeof rawStyle === 'string') {
                                             const trimmed = rawStyle.trim();
                                             if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                                                 try {
                                                     const parsed = JSON.parse(trimmed);
                                                     if (Array.isArray(parsed) && parsed.length > 0) {
                                                         styleLabel = parsed[0];
                                                     }
                                                 } catch (e) {}
                                             } else if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
                                                 styleLabel = trimmed.slice(1, -1).split(',')[0]?.trim().replace(/^"|"$/g, '') || "";
                                             } else {
                                                 styleLabel = trimmed;
                                             }
                                         }
                                        if (!styleLabel || styleLabel === '[') return null;
                                        return (
                                            <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
                                                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-white bg-black/60 px-2 py-1 rounded-none shadow-sm backdrop-blur-md">
                                                    {styleLabel}
                                                </span>
                                            </div>
                                        );
                                    })()}
                                </div>
                                
                                {/* Artist Peeker Tab */}
                                <div className="p-4 border-t border-gray-light bg-white flex justify-between items-center group-hover:bg-off-white transition-colors">
                                    <span className="text-[12px] font-mono uppercase tracking-widest text-black truncate max-w-[80%]">
                                        {sim.artist_name}
                                    </span>
                                    <span className="text-[11px] text-gray-mid">View</span>
                                </div>
                            </Link>
                        </div>
                    );
                })}
                
                {/* Infinite Loading Sentinel & Spinner */}
                {hasMore && (
                    <div 
                        ref={loadMoreNodeRef} 
                        className="min-w-[80vw] w-[80vw] md:min-w-[280px] md:w-[280px] flex-shrink-0 snap-start flex flex-col items-center justify-center border border-dashed border-gray-light bg-off-white"
                    >
                        <span className="text-[12px] text-gray-mid animate-pulse font-mono tracking-widest uppercase">Loading Recommendations...</span>
                    </div>
                )}
            </div>
        );
    };

    if (hideHeader) {
        return (
            <div className="w-full max-w-[1280px] px-4 md:px-8 mx-auto">
                {renderDesignsList()}
            </div>
        );
    }

    return (
        <section className="mt-12 md:mt-24 w-full bg-off-white py-16 md:py-24 border-t border-gray-light flex flex-col items-center">
            <div className="w-full max-w-[1280px] px-4 md:px-6">
                <h2 className="font-display text-[28px] md:text-[32px] text-black mb-8 md:mb-12">
                    Customers Also Explored
                </h2>
                {renderDesignsList()}
            </div>
        </section>
    );
}
