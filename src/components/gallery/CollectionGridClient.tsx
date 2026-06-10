"use client";

import { useState } from "react";
import MasonryGrid from "./MasonryGrid";
import { Design } from "@/types/database.types";
import { removeDesignFromCollection } from "@/actions/collections";
import { useToast } from "@/components/ui/Toast";

interface CollectionGridClientProps {
    initialDesigns: Design[];
    collectionId: string;
    isOwner: boolean;
}

export default function CollectionGridClient({ initialDesigns, collectionId, isOwner }: CollectionGridClientProps) {
    const [designs, setDesigns] = useState<Design[]>(initialDesigns);
    const { showToast } = useToast();

    const handleRemove = async (designId: string) => {
        // Optimistic UI update
        const previousDesigns = [...designs];
        setDesigns(designs.filter(d => d.id !== designId));

        const res = await removeDesignFromCollection(collectionId, designId);
        
        if (res.error) {
            showToast(res.error);
            setDesigns(previousDesigns); // Rollback
        } else {
            showToast("Design removed from collection");
        }
    };

    return (
        <div className="pt-8 border-t border-black">
            <div className="mb-8 flex justify-between items-end">
                <h2 className="font-mono text-[14px] uppercase tracking-widest text-black">
                    Collection Database ({designs.length})
                </h2>
            </div>
            
            {designs.length > 0 ? (
                <MasonryGrid 
                    designs={designs} 
                    onRemove={isOwner ? handleRemove : undefined} 
                />
            ) : (
                <div className="py-12 text-center border border-dashed border-gray-light bg-off-white">
                    <p className="font-mono text-[11px] uppercase text-gray-mid tracking-widest">
                        This collection is now empty.
                    </p>
                </div>
            )}
        </div>
    );
}
