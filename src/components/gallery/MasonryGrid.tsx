"use client";

import Image from "next/image";
import Link from "next/link";
import { Design } from "@/types/database.types";
import { blurhashToDataURL } from "@/lib/blurhash";
import { Trash2 } from "lucide-react";
import Masonry from "react-masonry-css";

interface MasonryGridProps {
    designs: Design[];
    onRemove?: (designId: string) => void;
}

export default function MasonryGrid({ designs, onRemove }: MasonryGridProps) {
    const breakpointColumnsObj = {
        default: 4,
        1024: 3,
        768: 2,
        640: 2
    };

    const handleRemove = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (onRemove) onRemove(id);
    };

    return (
        <Masonry
            breakpointCols={breakpointColumnsObj}
            className="design-masonry-grid"
            columnClassName="design-masonry-column"
        >
            {designs.map((design, index) => {
                const blurDataUrl = blurhashToDataURL(design.image_blurhash);

                return (
                    <div
                        key={design.id}
                        className="break-inside-avoid-column mb-6 group relative border border-gray-light rounded-none overflow-hidden bg-off-white will-change-transform transform-gpu animate-fade-in-up transition-all duration-300 ease-out"
                        style={{ animationDelay: `${(index % 4) * 0.1}s` }}
                    >
                        <Link href={`/gallery/${design.id}`} className="block" scroll={false}>
                            <Image
                                src={design.image_url}
                                alt={design.alt_text}
                                width={design.image_width}
                                height={design.image_height}
                                className="w-full h-auto object-cover"
                                placeholder="blur"
                                blurDataURL={blurDataUrl}
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                loading={index < 6 ? undefined : "lazy"}
                                priority={index < 6}
                            />

                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                                <div className="flex justify-end">
                                    {onRemove && (
                                        <button 
                                            onClick={(e) => handleRemove(e, design.id)}
                                            className="text-white hover:text-brand-red transition-colors p-2 bg-black/40"
                                            title="Remove from Collection"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-white bg-black/50 px-3 py-1.5 rounded-none">
                                        {design.style?.[0] || 'Tattoo'}
                                    </span>
                                    <span className="text-[13px] text-white font-medium">View</span>
                                </div>
                            </div>
                        </Link>
                    </div>
                );
            })}
        </Masonry>
    );
}
