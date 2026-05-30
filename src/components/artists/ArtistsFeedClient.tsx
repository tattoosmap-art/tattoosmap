"use client";

import { useState, useMemo, useEffect } from "react";
import { MapPin, Search, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { ArtistCardAdminActions } from "./ArtistCardAdminActions";

const STYLES = ['All', 'Fine Line', 'Blackwork', 'Realism', 'Japanese', 'Traditional', 'Minimalist', 'Geometry'];

type Artist = {
    id: string;
    full_name: string;
    location: string;
    avatar_url: string;
    specialty?: string | null;
    bio: string;
    link_url?: string | null;
    portfolio_images?: string[] | null;
    isMock?: boolean;
    is_approved?: boolean | null;
    contact_email?: string | null;
    contact_phone?: string | null;
};

type Props = {
    artists: Artist[];
    isAdmin: boolean;
};

// Smart URL optimizer to force CDNs to serve small thumbnails instead of heavy raw sources
function optimizeImageUrl(url: string): string {
    if (!url) return "";
    
    try {
        // 1. Auto-optimize Unsplash URLs to a lightweight 500px thumbnail
        if (url.includes("images.unsplash.com")) {
            const urlObj = new URL(url);
            urlObj.searchParams.set("w", "500");
            urlObj.searchParams.set("q", "75");
            urlObj.searchParams.set("fit", "crop");
            return urlObj.toString();
        }
        
        // 2. Auto-optimize Supabase storage images if transformation is enabled
        if (url.includes(".supabase.co/storage/v1/render/image")) {
             return url; // already running on Supabase CDN
        }
    } catch (e) {
        // Catch malformed strings safely
    }
    
    return url;
}

// Reusable reactive image component with elegant loading state and smooth transition
function OptimizedPortfolioImage({ src, alt }: { src: string; alt: string }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const optimizedSrc = optimizeImageUrl(src);

    return (
        <div className="relative w-full aspect-square bg-neutral-100 overflow-hidden">
            {/* Premium Shimmer Skeleton */}
            {!isLoaded && (
                <div className="absolute inset-0 bg-neutral-200 animate-pulse flex items-center justify-center">
                    <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest">Loading</span>
                </div>
            )}
            
            {/* The Native Optimized Image Element */}
            <Image
                src={optimizedSrc}
                alt={alt}
                fill
                sizes="(max-width: 768px) 33vw, 15vw"
                onLoad={() => setIsLoaded(true)}
                className={`object-cover transition-all duration-700 ease-out group-hover:scale-105
                    ${isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}
                `}
            />
        </div>
    );
}

// Smart geographic expansion engine ensuring "NY" == "New York", "BK" == "Brooklyn", etc.
function expandLocationAliases(text: string): string {
    const lowerText = text.toLowerCase();
    let expanded = lowerText;
    
    // 1. New York Mapping
    if (/\bny\b|\bnyc\b/i.test(text) || lowerText.includes("new york")) {
        expanded += " ny nyc new york";
    }
    // 2. Brooklyn Mapping
    if (/\bbrooklyn\b|\bbk\b/i.test(text)) {
        expanded += " brooklyn bk";
    }
    // 3. Los Angeles Mapping
    if (/\bla\b/i.test(text) || lowerText.includes("los angeles")) {
        expanded += " la los angeles";
    }
    // 4. San Francisco Mapping
    if (/\bsf\b/i.test(text) || lowerText.includes("san francisco")) {
        expanded += " sf san francisco";
    }
    
    return expanded;
}

export function ArtistsFeedClient({ artists, isAdmin }: Props) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeStyle, setActiveStyle] = useState("All");
    const [showOnlyPending, setShowOnlyPending] = useState(false);

    // 1. Compute Waiting List Size
    const pendingCount = useMemo(() => {
        return artists.filter(a => a.is_approved === false).length;
    }, [artists]);

    // 2. Automatic Safeguard: Auto-reset interactive toggler if list has been cleared out by actions
    useEffect(() => {
        if (pendingCount === 0 && showOnlyPending) {
            setShowOnlyPending(false);
        }
    }, [pendingCount, showOnlyPending]);

    // 3. Powerful real-time reactive filtering
    const filteredArtists = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();

        return artists.filter(artist => {
            // Admin Moderation Override
            if (showOnlyPending && artist.is_approved !== false) {
                return false;
            }

            // Style Filter
            const matchStyle = activeStyle === "All" || 
                artist.specialty?.toLowerCase().includes(activeStyle.toLowerCase());

            // Search Query Filter with Smart Location Expansions
            if (normalizedQuery === "") return matchStyle;

            const expandedLocation = expandLocationAliases(artist.location);
            
            const matchName = artist.full_name.toLowerCase().includes(normalizedQuery);
            const matchSpecialty = artist.specialty?.toLowerCase().includes(normalizedQuery) || false;
            
            // Location Match (performs cross-expansion search)
            const matchLocation = expandedLocation.includes(normalizedQuery) ||
                expandLocationAliases(normalizedQuery).split(" ").some(qPart => qPart.length > 1 && expandedLocation.includes(qPart));

            return matchStyle && (matchName || matchLocation || matchSpecialty);
        });
    }, [artists, searchQuery, activeStyle, showOnlyPending]);

    return (
        <>
            {/* 1. Interactive Search & Filter Sub-Section */}
            <section className="max-w-[1280px] mx-auto px-4 mt-12 mb-16">
                <div className="max-w-[700px] mx-auto flex flex-col gap-8">
                    
                    {/* Dynamic Search Bar */}
                    <div className="relative w-full border-b border-neutral-200">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" strokeWidth={2} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, city, or specialty..."
                            className="w-full py-3.5 pl-10 pr-4 text-[15px] font-sans text-black focus:outline-none placeholder:text-neutral-400 bg-neutral-50 border border-transparent focus:border-neutral-200 rounded-none transition-all"
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-widest text-neutral-400 hover:text-black"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Style Selection Ribbon */}
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {STYLES.map((style) => {
                            const isActive = activeStyle === style;
                            return (
                                <button
                                    key={style}
                                    onClick={() => setActiveStyle(style)}
                                    className={`px-4 py-1.5 text-[12px] font-mono uppercase tracking-[0.05em] transition-colors duration-300 border cursor-pointer
                                        ${isActive
                                            ? 'bg-black text-white border-black font-bold shadow-sm'
                                            : 'bg-transparent text-neutral-500 border-neutral-200 hover:border-black hover:text-black'
                                        }`}
                                >
                                    {style}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 2. Grid Feed Rendering Section */}
            <section className="max-w-[1280px] mx-auto px-4 md:px-6 py-8 mb-24">
                
                {/* Counter Notification & Admin Waiting List Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-4 border-b border-neutral-100">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                        Showing {filteredArtists.length} of {artists.length} Profiles
                    </span>

                    {/* Admin Review Queue Dashboard Button */}
                    {isAdmin && pendingCount > 0 && (
                        <button
                            onClick={() => setShowOnlyPending(!showOnlyPending)}
                            title="Filter directory to show only items awaiting verification"
                            className={`flex items-center gap-2.5 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] transition-all duration-300 border cursor-pointer select-none
                                ${showOnlyPending 
                                    ? 'bg-brand-red text-white border-brand-red hover:bg-black shadow-md font-bold' 
                                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-brand-red hover:text-brand-red shadow-sm'
                                }`}
                        >
                            <AlertTriangle className={`w-3.5 h-3.5 ${showOnlyPending ? 'animate-pulse' : ''}`} />
                            ({pendingCount}) {pendingCount === 1 ? 'Artist' : 'Artists'} on waiting list
                            {showOnlyPending && <span className="ml-1 text-[9px] opacity-90 bg-black/20 px-1.5 py-0.5">Active</span>}
                        </button>
                    )}
                </div>

                {filteredArtists.length === 0 ? (
                    <div className="py-24 text-center border border-dashed border-neutral-200 bg-neutral-50 flex flex-col items-center justify-center select-none">
                        <Search className="w-8 h-8 text-neutral-300 mb-4" strokeWidth={1} />
                        <h3 className="font-display text-[20px] text-black mb-2">
                            {showOnlyPending ? "Review Queue Empty" : "No artists found"}
                        </h3>
                        <p className="font-sans text-[14px] text-neutral-500 max-w-[320px] mx-auto">
                            {showOnlyPending 
                                ? "There are currently no pending applications that match your applied filters." 
                                : "Try adjusting your search queries or style filters."
                            }
                        </p>
                        {showOnlyPending && (
                            <button 
                                onClick={() => setShowOnlyPending(false)}
                                className="mt-4 font-mono text-[10px] uppercase tracking-widest text-brand-red hover:text-black font-bold underline decoration-dashed underline-offset-4 cursor-pointer"
                            >
                                Clear review filter
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                        {filteredArtists.map(artist => (
                            <article key={artist.id} className="relative flex flex-col bg-white border border-neutral-100 hover:border-neutral-300 transition-all duration-500 group shadow-sm hover:shadow-md">

                                {/* Pending Approval Alert Overlay for Admins */}
                                {isAdmin && artist.is_approved === false && (
                                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-amber-500/95 backdrop-blur-sm text-white font-mono text-[8px] font-bold uppercase tracking-[0.15em] z-20 flex items-center gap-1.5 shadow-sm border border-amber-400/30 select-none">
                                        <AlertTriangle className="w-3 h-3 shrink-0" /> Pending Approval
                                    </div>
                                )}

                                {/* Portfolio Grid */}
                                <div className="grid grid-cols-3 gap-0.5 overflow-hidden bg-neutral-100">
                                    {(artist.portfolio_images?.slice(0, 3) || []).map((imgUrl, i) => (
                                        <OptimizedPortfolioImage 
                                            key={i}
                                            src={imgUrl}
                                            alt={`${artist.full_name} Portfolio ${i + 1}`}
                                        />
                                    ))}
                                    {/* Placeholder slots if fewer than 3 images */}
                                    {Array.from({ length: Math.max(0, 3 - (artist.portfolio_images?.length || 0)) }).map((_, i) => (
                                        <div key={`empty-${i}`} className="w-full aspect-square bg-neutral-50 flex items-center justify-center">
                                            <span className="font-mono text-[9px] text-neutral-300 uppercase">No image</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Card Body */}
                                <div className="p-6 flex flex-col flex-grow">
                                    {/* Identity */}
                                    <div className="flex items-center gap-4 mb-5 pb-5 border-b border-neutral-100">
                                        <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-neutral-100 border border-neutral-100 shadow-sm">
                                            {artist.avatar_url ? (
                                                <Image
                                                    src={artist.avatar_url}
                                                    alt={artist.full_name}
                                                    fill
                                                    sizes="48px"
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-neutral-200 flex items-center justify-center text-neutral-400 font-mono text-[14px]">
                                                    {artist.full_name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <h3 className="font-sans text-[17px] font-bold text-black leading-tight tracking-tight truncate">
                                                {artist.full_name}
                                            </h3>
                                            <div className="flex items-center gap-1.5 mt-1 text-neutral-500">
                                                <MapPin className="w-3 h-3 shrink-0" strokeWidth={2} />
                                                <span className="font-mono text-[10px] uppercase tracking-widest truncate">
                                                    {artist.location}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Specialty & Bio */}
                                    <div className="flex flex-col gap-2 mb-6 flex-grow">
                                        {artist.specialty && (
                                            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand-red">
                                                {artist.specialty}
                                            </span>
                                        )}
                                        <p className="font-sans text-[14px] leading-relaxed text-neutral-600 line-clamp-3">
                                            {artist.bio}
                                        </p>
                                    </div>

                                    {/* Admin Controls OR Connect Button */}
                                    <div className="mt-auto flex flex-col gap-3">
                                        {/* Connect Button */}
                                        <a
                                            href={artist.link_url || "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-center py-3.5 bg-black text-white hover:bg-brand-red transition-colors duration-300 text-[11px] font-mono font-bold uppercase tracking-[0.15em] cursor-pointer"
                                        >
                                            Connect with {artist.full_name.split(' ')[0]}
                                        </a>

                                        {/* Admin Edit/Delete Controls */}
                                        {isAdmin && !artist.isMock && (
                                            <ArtistCardAdminActions artist={{
                                                id: artist.id,
                                                full_name: artist.full_name,
                                                avatar_url: artist.avatar_url,
                                                location: artist.location,
                                                specialty: artist.specialty || "",
                                                bio: artist.bio,
                                                link_url: artist.link_url || "",
                                                portfolio_images: artist.portfolio_images || [],
                                                is_approved: artist.is_approved || false,
                                                contact_email: artist.contact_email || "",
                                                contact_phone: artist.contact_phone || "",
                                            }} />
                                        )}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}
