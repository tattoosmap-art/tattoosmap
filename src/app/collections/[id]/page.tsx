import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Heart, Share2, Plus } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-server";
import { designService } from "@/services/designService";
import CollectionGridClient from "@/components/gallery/CollectionGridClient";

export const revalidate = 0; // Dynamic component

export default async function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    // Auth Check for "Edit" rights
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const viewerId = session?.user?.id;

    // 1. Fetch main collection metadata
    const { data: collection, error } = await supabaseAdmin
        .from('collections')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !collection) {
        console.error("[COLLECTION PAGE] Fetch Error:", error?.message || "Not found");
        notFound();
    }

    // 2. Fetch curator profile separately (resilient to join errors)
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', collection.user_id)
        .single();

    // 3. Fetch the actual designs
    let designs = [];
    if (collection.design_ids && collection.design_ids.length > 0) {
        const designPromises = collection.design_ids.map((dId: string) => designService.getDesignById(dId));
        const resolved = await Promise.all(designPromises);
        designs = resolved.filter(Boolean);
    }

    const isPublic = collection.is_public;
    const itemWord = designs.length === 1 ? "Blueprint" : "Blueprints";
    const curatorName = profile?.username || "Anonymous Archiver";

    return (
        <div className="w-full bg-white min-h-screen pb-32">
            
            {/* Header Controls */}
            <div className="sticky top-[73px] z-40 bg-white/80 backdrop-blur-md border-b border-gray-light px-4 md:px-6 py-4 flex items-center justify-between">
                <Link
                    href="/saved"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-black bg-black text-[11px] font-mono uppercase tracking-widest text-white hover:bg-brand-red transition-colors active:scale-[0.98]"
                    aria-label="Back to Archive"
                >
                    <ArrowLeft className="w-4 h-4" /> BACK TO ARCHIVE
                </Link>

                <div className="flex gap-4">
                    <button className="text-[13px] text-black hover:text-brand-red transition-colors flex items-center gap-2">
                        <Share2 className="w-4 h-4" strokeWidth={1.5} /> <span className="hidden sm:inline font-mono uppercase text-[11px]">Share</span>
                    </button>
                    {!isPublic && (
                        <span className="inline-flex items-center gap-2 px-3 py-1 border border-gray-light bg-off-white text-[10px] font-mono uppercase text-gray-mid">
                            Private File
                        </span>
                    )}
                </div>
            </div>

            <main className="max-w-[1280px] mx-auto px-4 md:px-6 pt-16">
                
                {/* Collection Metadata Hero */}
                <div className="flex flex-col gap-6 max-w-2xl border-l-[4px] border-brand-red pl-6 md:pl-10 mb-16 relative">
                    <div className="flex flex-col gap-2">
                        <h1 className="font-display text-[40px] md:text-[56px] leading-none text-black">
                            {collection.name}
                        </h1>
                        <div className="flex items-center gap-4 text-[12px] font-mono uppercase text-gray-mid tracking-widest mt-2">
                            <span>{designs.length} {itemWord}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-brand-red" /> {collection.like_count} Likes</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Updated {new Date(collection.updated_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    
                    {collection.description && (
                        <p className="text-[15px] text-gray-mid leading-relaxed max-w-xl">
                            {collection.description}
                        </p>
                    )}

                    {/* Curator Identity */}
                    <div className="mt-4 pt-6 border-t border-gray-light flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-off-white border border-gray-light overflow-hidden flex items-center justify-center font-mono text-[10px] text-black">
                            {curatorName[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-mono text-[10px] uppercase tracking-widest text-gray-mid">Curated By</span>
                            <span className="text-[13px] text-black font-medium">{curatorName}</span>
                        </div>
                    </div>
                </div>

                {/* The Masonry Gallery */}
                <CollectionGridClient 
                    initialDesigns={designs} 
                    collectionId={id} 
                    isOwner={viewerId === collection.user_id} 
                />

                {designs.length === 0 && (
                    <div className="py-24 border border-dashed border-gray-light flex flex-col items-center justify-center text-center bg-off-white">
                        <p className="text-[14px] text-gray-mid mb-6 max-w-sm">
                            This collection is currently empty. Start exploring the public gallery to find layouts and blueprints to save here.
                        </p>
                        <Link
                            href="/gallery"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-mono text-[12px] uppercase tracking-widest hover:bg-brand-red transition-colors"
                        >
                            <Plus className="w-4 h-4" /> BROWSE CATALOG
                        </Link>
                    </div>
                )}

            </main>
        </div>
    );
}
