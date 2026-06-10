"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

import {
    Bookmark,
    ArrowLeft,
    Eye,
    Compass,
    Zap,
    Scale,
    History,
    ShieldCheck,
    AlertTriangle,
    Droplet,
    Share2,
    Download,
    Heart,
    Library
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Design } from "@/types/database.types";
import { blurhashToDataURL } from "@/lib/blurhash";

import PainMap from "@/components/gallery/PainMap";
import ArtistSection from "@/components/gallery/ArtistSection";
import SaveButton from "@/components/gallery/SaveButton";
import DownloadButton from "@/components/gallery/DownloadButton";
import ShareActions from "@/components/gallery/ShareActions";
import MeaningExpansion from "@/components/gallery/MeaningExpansion";
import DownloadMasterButton from "@/components/gallery/DownloadMasterButton";
import { supabase } from "@/lib/supabase";

// ─────────────────────────────────────────────────────────────
// SIMPLE TOP BADGE BANNER
// ─────────────────────────────────────────────────────────────
function RotatingBanner() {
    const [flipState, setFlipState] = React.useState(false);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setFlipState(prev => !prev);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full bg-neutral-950 text-white border-b border-white/5 py-3 relative flex items-center justify-center min-h-[40px] overflow-hidden">
            
            {/* Center segment: Perfectly Centered sliding ticker (LG and up) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block">
                <div className="relative h-5 w-[480px] xl:w-[640px] overflow-hidden">
                    {/* Slide 1 */}
                    <div 
                        className="absolute inset-0 flex items-center justify-center font-mono text-[8px] xl:text-[10px] uppercase tracking-[0.15em] xl:tracking-[0.3em] text-neutral-400 transition-all duration-700 ease-in-out whitespace-nowrap"
                        style={{
                            opacity: flipState ? 0 : 1,
                            transform: flipState ? 'translateY(100%)' : 'translateY(0%)',
                            pointerEvents: flipState ? 'none' : 'auto'
                        }}
                    >
                        DESIGN INTELLIGENCE — MEANING <span className="mx-2 text-neutral-600">·</span> PAIN MAP <span className="mx-2 text-neutral-600">·</span> AGING SIMULATION
                    </div>
                    {/* Slide 2 */}
                    <div 
                        className="absolute inset-0 flex items-center justify-center font-mono text-[8px] xl:text-[10px] tracking-[0.15em] xl:tracking-[0.3em] text-neutral-400 transition-all duration-700 ease-in-out whitespace-nowrap"
                        style={{
                            opacity: flipState ? 1 : 0,
                            transform: flipState ? 'translateY(0%)' : 'translateY(-100%)',
                            pointerEvents: flipState ? 'auto' : 'none'
                        }}
                    >
                        𝕿𝖆𝖙𝖙𝖔𝖔𝖘𝖒𝖆𝖕 - 𝓑𝓮 𝓾𝓷𝓲𝓺𝓾𝓮
                    </div>
                </div>
            </div>

            {/* Center segment: Perfectly Centered sliding ticker (Mobile & Tablet) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:hidden">
                <div className="relative h-5 w-[240px] overflow-hidden">
                    {/* Slide 1 */}
                    <div 
                        className="absolute inset-0 flex items-center justify-center font-mono text-[8px] uppercase tracking-[0.2em] text-neutral-400 transition-all duration-700 ease-in-out whitespace-nowrap"
                        style={{
                            opacity: flipState ? 0 : 1,
                            transform: flipState ? 'translateY(100%)' : 'translateY(0%)',
                            pointerEvents: flipState ? 'none' : 'auto'
                        }}
                    >
                        MEANING <span className="mx-1 text-neutral-600">·</span> PAIN MAP <span className="mx-1 text-neutral-600">·</span> AGING
                    </div>
                    {/* Slide 2 */}
                    <div 
                        className="absolute inset-0 flex items-center justify-center font-mono text-[8px] tracking-[0.2em] text-neutral-400 transition-all duration-700 ease-in-out whitespace-nowrap"
                        style={{
                            opacity: flipState ? 1 : 0,
                            transform: flipState ? 'translateY(0%)' : 'translateY(-100%)',
                            pointerEvents: flipState ? 'auto' : 'none'
                        }}
                    >
                        𝕿𝖆𝖙𝖙𝖔𝖔𝖘𝖒𝖆𝖕 - 𝓑𝓮 𝓾𝓷𝓲𝓺𝓾𝓮
                    </div>
                </div>
            </div>

        </div>
    );
}

interface DesignDetailClientProps {
    design: Design;
    publicCollections?: any[];
    hideStickyNav?: boolean;
}

export default function DesignDetailClient({ design, publicCollections = [], hideStickyNav = false }: DesignDetailClientProps) {
    const [user, setUser] = React.useState<any>(null);
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'hotosevents@gmail.com';
    const isAdmin = user?.email === adminEmail;

    React.useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });
    }, []);

    const blurDataUrl = blurhashToDataURL(design.image_blurhash);
    const emotionTags = design.emotion_tags || [];
    const styleTags = design.style_tags || [];
    const placementRecs = design.placement_recommendations || [];

    return (
        <div className="w-full bg-white text-black selection:bg-brand-red selection:text-white">
            
            {/* Rotating Top Intelligence Banner */}
            <RotatingBanner />

            {/* ── STICKY NAVIGATION BAR ───────────────────────────── */}
            {!hideStickyNav && (
                <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200 px-4 md:px-8 py-4 flex items-center gap-4">
                    <Link
                        href="/gallery"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-200 text-[11px] font-mono uppercase tracking-widest text-black hover:bg-black hover:text-white transition-colors active:scale-[0.98]"
                    >
                        <ArrowLeft className="w-4 h-4" /> Gallery
                    </Link>
                    <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-neutral-400 max-w-[200px] md:max-w-none truncate">
                        / Gallery / {design.title || "Untitled"}
                    </span>
                </div>
            )}

            <main className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 md:py-16 flex flex-col gap-24 md:gap-32">

                {/* ═══════════════════════════════════════════ */}
                {/* SECTION 1 — THE HERO (VISUAL EXPLORER)     */}
                {/* ═══════════════════════════════════════════ */}
                <section aria-label="Design Hero" className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Sticky Visual Container — always first on ALL screen sizes */}
                    <div className="lg:col-span-7 order-first">
                        <div className="sticky top-[100px] border border-neutral-200 p-2 bg-neutral-50/50 group cursor-zoom-in">
                            <Image
                                src={design.image_shaded_url || design.image_url}
                                alt={design.alt_text || "Tattoo design composition"}
                                width={design.image_width || 800}
                                height={design.image_height || 1000}
                                className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                                placeholder="blur"
                                blurDataURL={blurDataUrl}
                                priority
                            />
                        </div>
                    </div>

                    {/* Dynamic Metadata Panel */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-[100px] flex flex-col gap-8">

                            {/* Category & Header */}
                            <div className="flex flex-col gap-4">
                                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-bold">
                                    {design.public_category?.replace(/-/g, ' ') || "Fine Line Ink"}
                                </span>
                                <h1 className="font-display text-[34px] lg:text-[44px] leading-[1.05] tracking-tight text-neutral-900 font-medium">
                                    {design.title || "Untitled Design"}
                                </h1>
                                
                                {/* Emotional & Styling Tags */}
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {emotionTags.map(tag => (
                                        <span key={tag} className="font-mono text-[9px] uppercase tracking-wider border border-neutral-900 text-neutral-900 px-2 py-0.5">
                                            {tag}
                                        </span>
                                    ))}
                                    {styleTags.map(tag => (
                                        <span key={tag} className="font-mono text-[9px] uppercase tracking-wider border border-neutral-200 text-neutral-400 px-2 py-0.5">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Dynamic User Statistics — only show if > 0 */}
                            {((design.save_count || 0) > 0 || (design.view_count || 0) > 0) ? (
                                <div className="flex gap-8 py-5 border-t border-b border-neutral-100 font-mono text-[11px] uppercase tracking-[0.1em] text-neutral-400">
                                    {(design.save_count || 0) > 0 && (
                                        <span className="flex items-center gap-2">
                                            <Bookmark className="w-3.5 h-3.5" /> {design.save_count} Saves
                                        </span>
                                    )}
                                    {(design.view_count || 0) > 0 && (
                                        <span className="flex items-center gap-2">
                                            <Eye className="w-3.5 h-3.5" /> {design.view_count} Views
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <div className="py-5 border-t border-b border-neutral-100">
                                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-300 italic">Be the first to save this design</span>
                                </div>
                            )}

                            {/* Core Application Action Gateways */}
                            <div className="flex flex-col gap-3">
                                <SaveButton 
                                    designId={design.id} 
                                    saveCount={design.save_count} 
                                    viewCount={design.view_count} 
                                />
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <DownloadButton 
                                        imageUrl={design.image_url} 
                                        designTitle={design.title || "design"} 
                                        designSlug={design.slug}
                                    />
                                    <ShareActions title={design.title || "Tattoo Design"} />
                                </div>

                                {isAdmin && (
                                    <DownloadMasterButton designSlug={design.slug} />
                                )}
                            </div>

                            {/* Technical & Market Demographics */}
                            {(() => {
                                // Clean up body_part — could be ["Flash"], {"Flash"}, "Flash", or ["Forearm", "Wrist"]
                                const rawPart = design.body_part as any;
                                let placements: string[] = [];
                                if (Array.isArray(rawPart)) {
                                    placements = rawPart.flatMap(p => {
                                        // Handle JSON-stringified arrays like '["Flash"]'
                                        if (typeof p === 'string' && p.startsWith('[')) {
                                            try { return JSON.parse(p); } catch { return [p]; }
                                        }
                                        return [p];
                                    });
                                } else if (typeof rawPart === 'string') {
                                    if (rawPart.startsWith('[')) {
                                        try { placements = JSON.parse(rawPart); } catch { placements = [rawPart]; }
                                    } else {
                                        placements = [rawPart];
                                    }
                                }
                                const placementLabel = placements.length > 0 ? placements.join(', ') : 'Multiple Zones';

                                // Parse styles array (ensuring stringified JSON is parsed safely)
                                let styles: string[] = [];
                                const rawStyles = design.style || [];
                                if (Array.isArray(rawStyles)) {
                                    styles = rawStyles.flatMap(s => {
                                        if (typeof s === 'string' && s.startsWith('[')) {
                                            try { return JSON.parse(s); } catch { return [s]; }
                                        }
                                        return [s];
                                    });
                                } else if (typeof (rawStyles as any) === 'string') {
                                    const strStyles = rawStyles as string;
                                    if (strStyles.startsWith('[')) {
                                        try { styles = JSON.parse(strStyles); } catch { styles = [strStyles]; }
                                    } else {
                                        styles = [strStyles];
                                    }
                                }

                                const primaryStyles = ["Traditional", "Realism", "Blackwork", "Japanese", "Geometric", "Watercolor", "Fine Line", "Neo-Traditional", "Minimalist", "Tribal", "New School"];
                                const primaryStylesNorm = primaryStyles.map(ps => ps.toLowerCase().replace(/[\s-_]/g, ''));
                                
                                let representativeStyle = '';
                                for (const s of styles) {
                                    const sNorm = s.toLowerCase().replace(/[\s-_]/g, '');
                                    const matchIdx = primaryStylesNorm.indexOf(sNorm);
                                    if (matchIdx !== -1) {
                                        representativeStyle = primaryStyles[matchIdx];
                                        break;
                                    }
                                }

                                if (!representativeStyle && styles.length > 0) {
                                    representativeStyle = styles[0].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                                }

                                const finalStyleLabel = representativeStyle || 'Fine Line';

                                const subStyles = styles
                                    .filter(s => {
                                        const sNorm = s.toLowerCase().replace(/[\s-_]/g, '');
                                        return sNorm !== finalStyleLabel.toLowerCase().replace(/[\s-_]/g, '');
                                    })
                                    .map(s => s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));

                                const elements = ((design as any).elements) || [];
                                let parsedElements: string[] = [];
                                if (Array.isArray(elements)) {
                                    parsedElements = elements;
                                } else if (typeof elements === 'string') {
                                    const trimmed = elements.trim();
                                    if (trimmed.startsWith('[')) {
                                        try { parsedElements = JSON.parse(trimmed); } catch { parsedElements = [trimmed]; }
                                    } else {
                                        parsedElements = [trimmed];
                                    }
                                }

                                const allSubTags = Array.from(new Set([
                                    ...subStyles,
                                    ...parsedElements.map(e => e.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))
                                ])).filter(Boolean);

                                return (
                                    <div className="flex flex-col gap-3 pt-2">
                                        <div className="flex justify-between items-start gap-2 text-[12px] font-mono tracking-wider uppercase border-b border-neutral-100 pb-3">
                                            <span className="text-neutral-400 shrink-0">Gender</span>
                                            <span className="text-black font-bold text-right">{design.gender_suitability || "Men and Women"}</span>
                                        </div>
                                        <div className="flex justify-between items-start gap-2 text-[12px] font-mono tracking-wider uppercase border-b border-neutral-100 pb-3">
                                            <span className="text-neutral-400 shrink-0">Placement</span>
                                            <span className="text-black font-bold text-right max-w-[55%]">{placementLabel}</span>
                                        </div>
                                        <div className="flex justify-between items-start gap-2 text-[12px] font-mono tracking-wider uppercase border-b border-neutral-100 pb-3">
                                            <span className="text-neutral-400 shrink-0">Style</span>
                                            <span className="text-black font-bold text-right max-w-[55%]">{finalStyleLabel}</span>
                                        </div>

                                        {allSubTags.length > 0 && (
                                            <div className="flex flex-col gap-2.5 pt-3">
                                                <span className="text-[10px] font-mono tracking-wider uppercase text-neutral-400">Design Tags</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {allSubTags.map((tag, idx) => (
                                                        <a 
                                                            key={idx} 
                                                            href={`/gallery?q=${encodeURIComponent(tag.toLowerCase())}`}
                                                            className="text-[10px] font-mono uppercase tracking-wider bg-neutral-50 hover:bg-black hover:text-white text-neutral-600 px-2.5 py-1 transition-all border border-neutral-100"
                                                        >
                                                            {tag}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════ */}
                {/* SECTION 2 — SYMBOLISM & NARRATIVE          */}
                {/* ═══════════════════════════════════════════ */}
                <section aria-label="Symbolism and Narrative" className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-t border-neutral-100 pt-16 md:pt-24">
                    <div className="lg:col-span-4 flex flex-col gap-3">
                        <div className="flex items-center gap-3 text-neutral-400 mb-1">
                            <Compass className="w-4 h-4" />
                            <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Story & Origin</span>
                        </div>
                        <h2 className="font-display text-[32px] md:text-[40px] text-neutral-900 leading-[1.1] tracking-tight">
                            Meaning &<br />Symbolism
                        </h2>
                    </div>
                    
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        <div className="relative">
                            <p className="text-[20px] lg:text-[23px] text-black leading-[1.5] font-medium italic border-l-4 border-black pl-6 md:pl-8">
                                {design.meaning || "The historical narrative of this specific fine-line icon is currently being digitized by our curators."}
                            </p>
                            
                            {/* The Expanding Detailed Story Node */}
                            <MeaningExpansion design={design} />
                        </div>

                        {/* Alert Module for Sensitive Art Styles */}
                        {design.cultural_sensitivity && (
                            <div className="p-6 bg-amber-50 border-l-4 border-amber-500 flex gap-4 items-start mt-4 shadow-sm">
                                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="block font-mono text-[11px] font-bold text-amber-800 uppercase mb-2 tracking-[0.1em]">Cultural Awareness Required</span>
                                    <p className="text-[14px] text-amber-900 leading-relaxed italic">{design.cultural_sensitivity}</p>
                                </div>
                            </div>
                        )}

                        {/* Heritage Summary Nodes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-neutral-100">
                            <div className="flex flex-col gap-2">
                                <span className="font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-400">Cultural Heritage</span>
                                <p className="text-[15px] text-black leading-relaxed">{design.cultural_origin || "Modern Western Minimalist / Contemporary Fine Line"}</p>
                                
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-400">Core Narrative</span>
                                <p className="text-[15px] text-black leading-relaxed">{design.speakable_summary || "An artistic visual composition capturing personal transformation through structural linework."}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════ */}
                {/* SECTION 3 — ARTIST EXECUTION SPEC           */}
                {/* ═══════════════════════════════════════════ */}
                <section aria-label="Artist Technical Parameters" className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-t border-neutral-100 pt-16 md:pt-24">
                    <div className="lg:col-span-4 flex flex-col gap-3">
                        <div className="flex items-center gap-3 text-neutral-400 mb-1">
                            <Droplet className="w-4 h-4" />
                            <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Artist Insight</span>
                        </div>
                        <h2 className="font-display text-[32px] md:text-[40px] text-neutral-900 leading-[1.1] tracking-tight">
                            Technical<br />Detail
                        </h2>
                        <p className="text-neutral-500 text-[13px] mt-1 max-w-[300px] font-sans leading-relaxed">
                            Specific needle mapping and specialized care configurations suggested for professional application.
                        </p>
                    </div>
                    <div className="lg:col-span-8">
                        <ArtistSection
                            minimumSizeCm={design.minimum_size_cm || 5.0}
                            recommendedNeedle={design.recommended_needle || "3RL / 1RL Detail"}
                            artistTechnicalNotes={design.artist_technical_notes || "Fine line tattoos require consistent hand speed and depth control. Avoid overworking the epidermis layer to prevent blowout."}
                            placementRecommendations={placementRecs}
                            agingPrediction={design.aging_prediction || "Fine lines soften naturally. Advise clients to avoid direct UV exposure for the first 30 days."}
                        />
                    </div>
                </section>

                {/* ═══════════════════════════════════════════ */}
                {/* SECTION 4 — PAIN MAP ATLAS                  */}
                {/* ═══════════════════════════════════════════ */}
                <section aria-label="Anatomical Pain Assessment" className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-t border-neutral-100 pt-16 md:pt-24">
                    <div className="lg:col-span-4 flex flex-col gap-3">
                        <div className="flex items-center gap-3 text-neutral-400 mb-1">
                            <Scale className="w-4 h-4" />
                            <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Pain Assessment</span>
                        </div>
                        <h2 className="font-display text-[32px] md:text-[40px] text-neutral-900 leading-[1.1] tracking-tight">
                            Sensitivity<br />Density
                        </h2>
                        <p className="text-neutral-500 text-[13px] mt-1 max-w-[300px] font-sans leading-relaxed">
                            Detailed sensitivity density indicators correlated to your chosen placement positions.
                        </p>
                    </div>
                    <div className="lg:col-span-8 border border-neutral-100 p-6 bg-neutral-50/30">
                        <PainMap data={design.pain_level_map || {}} />
                    </div>
                </section>

                {/* ═══════════════════════════════════════════ */}
                {/* SECTION 5 — CELLULAR AGING REPORT           */}
                {/* ═══════════════════════════════════════════ */}
                <section aria-label="Longevity Analysis" className="border-t border-neutral-100 pt-16 md:pt-24">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
                        <div className="lg:col-span-4 flex flex-col gap-3">
                            <div className="flex items-center gap-3 text-neutral-400 mb-1">
                                <History className="w-4 h-4" />
                                <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Healing & Aging</span>
                            </div>
                            <h2 className="font-display text-[32px] md:text-[40px] text-neutral-900 leading-[1.1] tracking-tight">
                                Natural<br />Evolution
                            </h2>
                        </div>
                        <div className="lg:col-span-8 flex flex-col justify-end gap-4">
                            <p className="text-[16px] text-neutral-700 leading-relaxed border-l-2 border-blue-400 pl-6 italic max-w-2xl font-serif">
                                {design.aging_prediction || "Fine line artwork naturally softens and spreads microscopic fractions inside the dermis. Expect a beautifully blended, soft charcoal appearance over the course of 10 years."}
                            </p>
                        </div>
                    </div>

                    {/* PREMIUM AGING INTERACTIVE SIMULATOR */}
                    {/* PREMIUM AGING INTERACTIVE SIMULATOR — REAL-TIME ANATOMICAL OVERLAY */}
                    <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-0 border border-neutral-200 bg-white overflow-hidden">
                        
                        {(() => {
                            // Determine if we have high-fidelity AI generated composite assets or if we fallback to browser CSS blends
                            const hasFreshComposite = design.image_fresh_url && design.image_fresh_url !== design.image_url;
                            const hasHealedComposite = design.image_healed_url && design.image_healed_url !== design.image_url;
                            
                            const skinBackdrop = "/stock-skin.png";

                            return (
                                <>
                                    {/* Day One: Fresh Application On Skin */}
                                    <div className="relative overflow-hidden group h-[380px] sm:h-[350px] md:h-[500px] bg-neutral-100 isolation-auto">
                                        {hasFreshComposite ? (
                                            // PRE-RENDERED HYPER-REALISTIC COMPOSITE (FULL-BLEED API OUTPUT)
                                            <Image
                                                src={design.image_fresh_url!}
                                                alt="High-fidelity fresh tattoo application composite"
                                                fill
                                                className="object-cover transition-all duration-700"
                                                sizes="50vw"
                                                priority
                                            />
                                        ) : (
                                            // BROWSER CSS FALLBACK ENGINE (FOR RAW DESIGNS)
                                            <>
                                                <Image
                                                    src={skinBackdrop}
                                                    alt="Anatomical skin placement context"
                                                    fill
                                                    className="object-cover contrast-[1.05] z-0"
                                                    sizes="50vw"
                                                />
                                                <div className="absolute inset-6 sm:inset-12 md:inset-24 z-10">
                                                    <Image
                                                        src={design.image_url}
                                                        alt="Fresh tattoo overlay rendering"
                                                        fill
                                                        className="object-contain transition-all duration-700 mix-blend-multiply contrast-150 brightness-90"
                                                        sizes="40vw"
                                                        style={{
                                                            filter: "drop-shadow(0 0 0.5px rgba(185, 28, 28, 0.3))", // Micro swelling
                                                            opacity: 0.9
                                                        }}
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {/* Labels */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 md:p-6 pt-10 md:pt-16 z-20 pointer-events-none">
                                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1">
                                                <div>
                                                    <span className="block font-mono text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-white/60 mb-0.5">Day One</span>
                                                    <span className="block font-display text-[14px] md:text-[22px] text-white leading-none font-bold">Fresh Ink</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1 sm:mt-0">
                                                    <span className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#4ade80] animate-pulse" />
                                                    <span className="font-mono text-[7px] md:text-[10px] text-white/80 uppercase tracking-widest">Sharp</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 5 Years +: Healed & Settled On Skin */}
                                    <div className="relative overflow-hidden group border-t sm:border-t-0 sm:border-l border-neutral-200 h-[380px] sm:h-[350px] md:h-[500px] bg-neutral-100 isolation-auto">
                                        {hasHealedComposite ? (
                                            // PRE-RENDERED HYPER-REALISTIC AGED COMPOSITE (FULL-BLEED API OUTPUT)
                                            <Image
                                                src={design.image_healed_url!}
                                                alt="High-fidelity 5-year healed tattoo simulation composite"
                                                fill
                                                className="object-cover transition-all duration-1000 group-hover:scale-105"
                                                sizes="50vw"
                                            />
                                        ) : (
                                            // BROWSER CSS FALLBACK ENGINE (FOR RAW DESIGNS)
                                            <>
                                                <Image
                                                    src={skinBackdrop}
                                                    alt="Anatomical skin aging context"
                                                    fill
                                                    className="object-cover grayscale-[15%] brightness-90 contrast-[0.95] z-0"
                                                    sizes="50vw"
                                                />
                                                <div className="absolute inset-6 sm:inset-12 md:inset-24 z-10">
                                                    <Image
                                                        src={design.image_url}
                                                        alt="Healed tattoo simulation overlay"
                                                        fill
                                                        className="object-contain transition-all duration-1000 mix-blend-multiply blur-[0.8px] brightness-75 contrast-125 group-hover:blur-none group-hover:opacity-90"
                                                        sizes="40vw"
                                                        style={{ opacity: 0.6 }}
                                                    />
                                                </div>
                                                <div className="absolute inset-0 bg-amber-950/5 opacity-10 mix-blend-overlay pointer-events-none z-20" />
                                            </>
                                        )}

                                        {/* Labels */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 md:p-6 pt-10 md:pt-16 z-20 pointer-events-none">
                                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1">
                                                <div>
                                                    <span className="block font-mono text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-white/60 mb-0.5">5 Years +</span>
                                                    <span className="block font-display text-[14px] md:text-[22px] text-white leading-none font-bold">Healed Ink</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-1 sm:mt-0">
                                                    <span className="w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                                                    <span className="font-mono text-[7px] md:text-[10px] text-white/80 uppercase tracking-widest">Natural Fade</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>

                    {/* Bottom Specs Maintenance Summary */}
                    {(() => {
                        // Derive longevity grade from style & placement
                        const styles = design.style || [];
                        const styleStr = Array.isArray(styles) ? styles.join(' ').toLowerCase() : String(styles).toLowerCase();
                        const placements = design.body_part || [];
                        const placementStr = Array.isArray(placements) ? placements.join(' ').toLowerCase() : String(placements).toLowerCase();
                        let grade = 'A';
                        let gradeColor = 'text-emerald-400';
                        let gradeNote = 'Fine line designs hold excellent detail over time with proper sunscreen care.';
                        if (placementStr.includes('rib') || placementStr.includes('hand') || placementStr.includes('finger') || placementStr.includes('foot')) {
                            grade = 'B+';
                            gradeColor = 'text-amber-400';
                            gradeNote = 'High-friction placement accelerates natural fading. Annual touch-ups recommended.';
                        } else if (styleStr.includes('watercolor') || styleStr.includes('white')) {
                            grade = 'B';
                            gradeColor = 'text-amber-500';
                            gradeNote = 'Watercolor styles fade faster due to low ink saturation. Touch-ups expected after 3–5 years.';
                        } else if (styleStr.includes('blackwork') || styleStr.includes('traditional')) {
                            grade = 'A+';
                            gradeColor = 'text-emerald-300';
                            gradeNote = 'Bold blackwork holds its definition exceptionally well over decades with minimal care.';
                        }
                        return (
                            <div className="mt-0 border border-t-0 border-neutral-200 bg-neutral-50 text-neutral-800 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                                <div className="flex flex-col gap-1.5 flex-1">
                                    <div className="flex items-center gap-2 text-neutral-500 mb-1">
                                        <ShieldCheck className="w-4 h-4" />
                                        <span className="font-mono text-[10px] uppercase tracking-[0.3em] font-medium">Care & Longevity Guide</span>
                                    </div>
                                    <p className="font-sans text-[12px] text-neutral-600 max-w-2xl leading-relaxed">
                                        {gradeNote} Apply SPF 50+ sunscreen daily once healed to protect ink pigment from UV breakdown.
                                    </p>
                                </div>
                                <div className="flex flex-col md:items-end shrink-0 px-6 py-3 bg-white border border-neutral-200">
                                    <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">LONGEVITY GRADE</span>
                                    <span className={`font-display text-[26px] tracking-tight font-medium ${gradeColor}`}>GRADE {grade}</span>
                                </div>
                            </div>
                        );
                    })()}
                </section>



                {/* ═══════════════════════════════════════════ */}
                {/* SECTION 7 — NEXT STRATEGIC ACTIONS         */}
                {/* ═══════════════════════════════════════════ */}
                <section aria-label="Next Interaction Steps" className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-neutral-100 pt-16 md:pt-24">
                    <a 
                        href="/gallery" 
                        className="w-full py-10 flex flex-col items-center justify-center gap-2 border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50 transition-all duration-300 group active:scale-[0.98] bg-white"
                    >
                        <span className="font-mono text-[12px] uppercase tracking-[0.2em] text-neutral-900 font-medium">Browse Catalog</span>
                        <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest mt-0.5">Return to visual exploration</span>
                    </a>
                    <Link 
                        href={`/try-on?design=${encodeURIComponent(design.image_url)}`} 
                        className="w-full py-10 flex flex-col items-center justify-center gap-2 bg-neutral-900 text-white hover:bg-black hover:shadow-md transition-all duration-300 group border border-neutral-900 active:scale-[0.98]"
                    >
                        <span className="font-mono text-[12px] uppercase tracking-[0.2em] font-medium text-white">Apply to Skin</span>
                        <span className="font-mono text-[9px] text-white/60 uppercase tracking-widest mt-0.5">Launch visual simulator</span>
                    </Link>
                </section>

            </main>
        </div>
    );
}
