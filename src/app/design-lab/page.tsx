"use client";

import React, { useState } from "react";
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
    Share2,
    Download,
    Heart,
    AlertTriangle,
    Droplet,
} from "lucide-react";
import PainMap from "@/components/gallery/PainMap";
import ArtistSection from "@/components/gallery/ArtistSection";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────

function RotatingBanner() {
    const [step, setStep] = React.useState(0);
    const messages = [
        "Design · Meaning · Execution · Pain Level · Aging",
        "Everything you need to know before the needle."
    ];

    React.useEffect(() => {
        const timer = setInterval(() => {
            setStep((s) => (s + 1) % messages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [messages.length]);

    return (
        <div className="w-full bg-neutral-950 text-white overflow-hidden border-b border-white/5">
            <div className="max-w-[1280px] mx-auto h-10 relative" style={{ perspective: "1000px" }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ rotateX: -90, opacity: 0 }}
                        animate={{ rotateX: 0, opacity: 1 }}
                        exit={{ rotateX: 90, opacity: 0 }}
                        transition={{ 
                            duration: 0.8, 
                            ease: [0.4, 0, 0.2, 1] // Luxury smooth easing
                        }}
                        className="absolute inset-0 flex items-center justify-center gap-4 px-6"
                        style={{ backfaceVisibility: "hidden" }}
                    >
                        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400 text-center">
                            {messages[step]}
                        </span>
                        {step === 0 && <span className="h-1 w-1 bg-brand-red rounded-full" />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// SIMULATED DATA — the exact output our Gemini pipeline produces
// ─────────────────────────────────────────────────────────────
const MOCK_DESIGN = {
    title: "Crescent Moon & Wildflower Bouquet",
    subject: "crescent moon cradling cascading wildflowers with geometric dotwork points",
    alt_text: "Minimalist fine-line tattoo of a crescent moon cradling a delicate bouquet of wildflowers with soft dotwork shading.",
    image_url: "/designs/fine-line-crescent-moon-and-floral-bouquet-delicate-cm.webp",
    image_width: 800,
    image_height: 1000,
    public_category: "celestial-mystical",
    mood: "delicate",
    save_count: 14,
    view_count: 420,

    // Persona — Enthusiast
    meaning: "This design explores the duality between the nocturnal, mysterious energy of the moon and the life-affirming growth of spring flora. The 'cradling' composition symbolizes protection and the nurturing of one's inner creative self through cycles of change (the moon) and periods of blooming (the flowers). It reflects the tension between the cold, static celestial body and the vibrant, temporary beauty of nature.",
    cultural_origin: "Draws heavily from 19th-century Victorian 'Language of Flowers' (Floriography) combined with modern Western celestial minimalism. It adheres to the 'Memento Vivere' tradition — a reminder to live and bloom even in the dark.",
    cultural_sensitivity: null,
    speakable_summary: "A sophisticated fine-line tattoo design combining celestial symbolism with botanical elegance, perfect for forearm or ribs placement.",

    // Tags
    emotion_tags: ["growth", "protection", "feminine power", "mystery"],
    style_tags: ["fine-line", "botanical", "dotwork", "celestial"],
    gender_suitability: "Unisex",

    // Persona — First-Timer / Planner
    placement_recommendations: [
        "Forearm outer — flat surface ensures the moon curved lines do not distort",
        "Ribs — follows the natural contour of the body, though higher pain level",
        "Inner wrist — ideal for the 6–8 cm scale, highly visible",
        "Shoulder blade — large canvas allows for beautiful upward floral flow",
    ],
    pain_level_map: {
        forearm_outer: "low",
        forearm_inner: "medium",
        upper_arm: "low",
        shoulder: "low",
        shoulder_blade: "medium",
        chest: "high",
        ribs: "high",
        stomach: "medium",
        wrist: "medium",
        ankle: "high",
        foot: "high",
        behind_ear: "high",
        neck: "high",
        thigh: "low",
        calf: "medium",
    } as Record<string, "low" | "medium" | "high">,

    // Persona — Artist
    minimum_size_cm: 6.5,
    recommended_needle: "3RL outline / 1RL detail",
    artist_technical_notes: "The 3RL is essential for the moon's weight to contrast against the 1RL floral details. Watch for the overlap between the flower stems and the moon's inner curve — ensure clear breathing room in the stencil to avoid ink bleed. The wrist placement carries a higher risk of blowout due to thin skin; recommend a very light hand for the stamen dots.",

    // Persona — Collector
    aging_prediction: "The high-contrast moon outline will hold its shape well over 10 years, though the fine stippling (dotwork) in the flowers will soften and blur into a soft grey wash. The sharp points of the crescent may require a minor touch-up in 7–8 years to maintain their crispness as the skin loses elasticity.",
};

// ─────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────────────────────
export default function DesignLabPage() {
    const design = MOCK_DESIGN;
    const [saved, setSaved] = useState(false);

    return (
        <div className="w-full bg-white">

            <RotatingBanner />

            {/* ── STICKY NAV ──────────────────────────────── */}
            <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200 px-4 md:px-8 py-4 flex items-center gap-4">
                <Link
                    href="/gallery"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-200 text-[11px] font-mono uppercase tracking-widest text-black hover:bg-black hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Gallery
                </Link>
                <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-neutral-400">
                    / Design Lab / {design.title}
                </span>
            </div>

            <main className="max-w-[1280px] mx-auto px-4 md:px-8 py-16 flex flex-col gap-28">

                {/* ═══════════════════════════════════════════ */}
                {/* SECTION 1 — HERO                           */}
                {/* ═══════════════════════════════════════════ */}
                <section aria-label="Design Hero" className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Image */}
                    <div className="lg:col-span-7">
                        <div className="sticky top-[80px]">
                            <Image
                                src={design.image_url}
                                alt={design.alt_text}
                                width={design.image_width}
                                height={design.image_height}
                                className="w-full h-auto"
                                priority
                            />
                        </div>
                    </div>

                    {/* Meta */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-[80px] flex flex-col gap-8">

                            {/* Title + Tags */}
                            <div className="flex flex-col gap-4">
                                <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-400">
                                    {design.public_category.replace(/-/g, ' ')}
                                </span>
                                <h1 className="font-display text-[44px] lg:text-[52px] leading-[1] text-black">
                                    {design.title}
                                </h1>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {design.emotion_tags.map(tag => (
                                        <span key={tag} className="font-mono text-[10px] uppercase tracking-tight bg-black text-white px-2.5 py-1">
                                            {tag}
                                        </span>
                                    ))}
                                    {design.style_tags.map(tag => (
                                        <span key={tag} className="font-mono text-[10px] uppercase tracking-tight border border-neutral-200 text-neutral-400 px-2.5 py-1">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Social Proof — Hidden for launch */}
                            <div className="border-t border-neutral-100"></div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => setSaved(!saved)}
                                    className={`w-full py-4 font-mono text-[12px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 border-2 transition-all ${
                                        saved
                                            ? "bg-black text-white border-black"
                                            : "bg-brand-red text-white border-brand-red hover:bg-black hover:border-black"
                                    }`}
                                >
                                    <Heart className={`w-4 h-4 ${saved ? "fill-white" : ""}`} />
                                    {saved ? "Saved to Collection" : "Save Design"}
                                </button>
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="py-3 font-mono text-[11px] uppercase tracking-[0.15em] border border-neutral-200 text-neutral-600 hover:border-black hover:text-black transition-colors flex items-center justify-center gap-2">
                                        <Download className="w-3.5 h-3.5" /> Download
                                    </button>
                                    <button className="py-3 font-mono text-[11px] uppercase tracking-[0.15em] border border-neutral-200 text-neutral-600 hover:border-black hover:text-black transition-colors flex items-center justify-center gap-2">
                                        <Share2 className="w-3.5 h-3.5" /> Share
                                    </button>
                                </div>
                            </div>

                            {/* Quick Specs */}
                            <div className="flex flex-col gap-3 pt-2">
                                <div className="flex justify-between items-center text-[12px] font-mono tracking-wider uppercase border-b border-neutral-100 pb-3">
                                    <span className="text-neutral-400">Suitability</span>
                                    <span className="text-black font-bold">{design.gender_suitability}</span>
                                </div>
                                <div className="flex justify-between items-center text-[12px] font-mono tracking-wider uppercase">
                                    <span className="text-neutral-400">Style</span>
                                    <span className="text-black font-bold">{design.mood}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════ */}
                {/* SECTION 2 — SYMBOLISM (Enthusiast)         */}
                {/* ═══════════════════════════════════════════ */}
                <section aria-label="Symbolism" className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-t-[6px] border-black pt-16">
                    <div className="lg:col-span-4">
                        <div className="flex items-center gap-3 text-brand-red mb-4">
                            <Compass className="w-4 h-4" />
                            <span className="font-mono text-[11px] uppercase font-bold tracking-[0.2em]">The Anthropologist's Report</span>
                        </div>
                        <h2 className="font-display text-[40px] lg:text-[52px] text-black leading-none">
                            Meaning &<br />Symbolism
                        </h2>
                    </div>
                    <div className="lg:col-span-8 flex flex-col gap-10">
                        <p className="text-[20px] lg:text-[22px] text-black leading-[1.5] font-medium italic border-l-4 border-black pl-8">
                            "{design.meaning}"
                        </p>

                        {design.cultural_sensitivity && (
                            <div className="p-6 bg-amber-50 border-l-4 border-amber-500 flex gap-4 items-start">
                                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="block font-mono text-[11px] font-bold text-amber-800 uppercase mb-2 tracking-[0.1em]">Cultural Sensitivity Note</span>
                                    <p className="text-[14px] text-amber-900 leading-relaxed">{design.cultural_sensitivity}</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-neutral-100">
                            <div className="flex flex-col gap-2">
                                <span className="font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-400">Cultural Heritage</span>
                                <p className="text-[14px] text-black leading-relaxed">{design.cultural_origin}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-400">Core Narrative</span>
                                <p className="text-[14px] text-black leading-relaxed">{design.speakable_summary}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════ */}
                {/* SECTION 3 — EXECUTION SPEC (Artist)       */}
                {/* ═══════════════════════════════════════════ */}
                <section aria-label="Artist Technical Section" className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-t-[6px] border-neutral-100 pt-16">
                    <div className="lg:col-span-4">
                        <div className="flex items-center gap-3 text-brand-red mb-4">
                            <Droplet className="w-4 h-4" />
                            <span className="font-mono text-[11px] uppercase font-bold tracking-[0.2em]">For the Artist</span>
                        </div>
                        <h2 className="font-display text-[40px] lg:text-[52px] text-black leading-none uppercase">
                            Execution<br />Spec
                        </h2>
                    </div>
                    <div className="lg:col-span-8">
                        <ArtistSection
                            minimumSizeCm={design.minimum_size_cm}
                            recommendedNeedle={design.recommended_needle}
                            artistTechnicalNotes={design.artist_technical_notes}
                            placementRecommendations={design.placement_recommendations}
                            agingPrediction={design.aging_prediction}
                        />
                    </div>
                </section>

                {/* ═══════════════════════════════════════════ */}
                {/* SECTION 4 — PAIN MAP (Planner)             */}
                {/* ═══════════════════════════════════════════ */}
                <section aria-label="Pain Map" className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-t-[6px] border-neutral-100 pt-16">
                    <div className="lg:col-span-4">
                        <div className="flex items-center gap-3 text-emerald-500 mb-4">
                            <Scale className="w-4 h-4" />
                            <span className="font-mono text-[11px] uppercase font-bold tracking-[0.2em]">The Planner's Guide</span>
                        </div>
                        <h2 className="font-display text-[40px] lg:text-[52px] text-black leading-none uppercase">
                            Pain Level<br />Map
                        </h2>
                    </div>
                    <div className="lg:col-span-8">
                        <PainMap data={design.pain_level_map} />
                    </div>
                </section>

                {/* ═══════════════════════════════════════════ */}
                {/* SECTION 5 — AGING REPORT (Collector)       */}
                {/* ═══════════════════════════════════════════ */}
                <section aria-label="Aging Report" className="border-t-[6px] border-neutral-100 pt-16">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
                        <div className="lg:col-span-4">
                            <div className="flex items-center gap-3 text-blue-500 mb-4">
                                <History className="w-4 h-4" />
                                <span className="font-mono text-[11px] uppercase font-bold tracking-[0.2em]">The Collector's Log</span>
                            </div>
                            <h2 className="font-display text-[40px] lg:text-[52px] text-black leading-none uppercase">
                                Aging<br />Report
                            </h2>
                        </div>
                        <div className="lg:col-span-8 flex flex-col justify-end gap-4">
                            <p className="text-[15px] text-neutral-600 leading-relaxed border-l-2 border-blue-400 pl-6 italic max-w-2xl">
                                {design.aging_prediction}
                            </p>
                        </div>
                    </div>

                    {/* Comparison Block */}
                    <div className="relative grid grid-cols-1 md:grid-cols-2 gap-0 border border-neutral-200">

                        {/* Fresh */}
                        <div className="relative overflow-hidden group">
                            <Image
                                src="/lab/tattoo-fresh-forearm.png"
                                alt="Fresh crescent moon wildflower tattoo on forearm, day one — crisp deep black linework"
                                width={800}
                                height={800}
                                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                            />
                            {/* Label */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-16">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <span className="block font-mono text-[10px] uppercase tracking-[0.3em] text-white/50 mb-1">Day 1</span>
                                        <span className="block font-display text-[22px] text-white leading-none">Fresh Ink</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#4ade80]" />
                                        <span className="font-mono text-[10px] text-white/70 uppercase tracking-widest">Crisp & Sharp</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Divider Line (Desktop) */}
                        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-neutral-200 z-10 pointer-events-none" />

                        {/* Aged */}
                        <div className="relative overflow-hidden group border-t border-neutral-200 md:border-t-0 md:border-l">
                            <Image
                                src="/lab/tattoo-aged-forearm.png"
                                alt="5-year aged crescent moon wildflower tattoo on forearm — naturally faded, softened lines integrated into skin"
                                width={800}
                                height={800}
                                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                            />
                            {/* Label */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-16">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <span className="block font-mono text-[10px] uppercase tracking-[0.3em] text-white/50 mb-1">5 Years</span>
                                        <span className="block font-display text-[22px] text-white leading-none">Healed</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                                        <span className="font-mono text-[10px] text-white/70 uppercase tracking-widest">Softened</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Footer Detail */}
                    <div className="mt-0 border border-t-0 border-neutral-200 bg-neutral-50 p-6 flex flex-col md:flex-row gap-4 md:items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-400">Technical Note</span>
                            <p className="font-mono text-[12px] text-neutral-500 max-w-2xl leading-relaxed">
                                Natural ink diffusion occurs in the dermis layer. Proper sun protection (SPF 50+) is critical for maintaining line weight contrast over time.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════ */}
                {/* SECTION 6 — NEXT STEPS                     */}
                {/* ═══════════════════════════════════════════ */}
                <section aria-label="Next Steps" className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t-[6px] border-neutral-100 pt-16">
                    <Link href="/gallery" className="w-full py-8 flex flex-col items-center justify-center gap-2 border-2 border-neutral-200 hover:border-black transition-colors group">
                        <span className="font-mono text-[13px] uppercase tracking-[0.2em] font-bold group-hover:text-brand-red transition-colors text-black">Browse More Designs</span>
                        <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">Return to gallery</span>
                    </Link>
                    <Link href={`/try-on?design=${encodeURIComponent(design.image_url)}`} className="w-full py-8 flex flex-col items-center justify-center gap-2 bg-brand-red text-white hover:bg-black transition-colors group border-2 border-brand-red hover:border-black">
                        <span className="font-mono text-[13px] uppercase tracking-[0.2em] font-bold group-hover:text-white transition-colors">Try This On Your Skin</span>
                        <span className="font-mono text-[10px] text-white/70 uppercase tracking-widest">Open virtual try-on studio</span>
                    </Link>
                </section>

            </main>
        </div>
    );
}
