"use client";

import React from "react";
import Link from "next/link";
import { Calculator, Map, Activity, Zap, Shield, ArrowUpRight, ScanEye } from "lucide-react";

const TOOL_DIRECTORY = [
    {
        id: "try-on",
        name: "Tattoo Try-On Studio",
        desc: "Composite any design onto your actual photo with 100% pixel fidelity. Zero AI hallucination.",
        icon: <ScanEye className="w-7 h-7" />,
        href: "/try-on",
        tag: "LIVE ENGINE",
        color: "bg-emerald-500"
    },
    {
        id: "cost-estimator",
        name: "Tattoo Cost Calculator",
        desc: "Calculate exact session timelines and predicted pricing based on size, area, and detailing.",
        icon: <Calculator className="w-7 h-7" />,
        href: "/tools/cost-estimator",
        tag: "PRICE INDEX",
        color: "bg-brand-red"
    },
    {
        id: "pain-map",
        name: "Anatomy Pain Chart",
        desc: "An interactive atlas mapping biological pain variance across different skin density zones.",
        icon: <Map className="w-7 h-7" />,
        href: "/tools/pain-map",
        tag: "PLACEMENT",
        color: "bg-brand-red"
    },
    {
        id: "healing-tracker",
        name: "Post-Ink Recovery Tracker",
        desc: "Project the cellular healing process day-by-day to monitor normal vs abnormal recovery.",
        icon: <Activity className="w-7 h-7" />,
        href: "/tools/healing-tracker",
        tag: "BIOLOGY",
        color: "bg-brand-red"
    },
    {
        id: "skin-compatibility",
        name: "Aftercare Product Analyzer",
        desc: "Determine if your existing skincare items violate aftercare protocol guidelines.",
        icon: <Shield className="w-7 h-7" />,
        href: "/tools/skin-compatibility",
        tag: "FORMULA",
        color: "bg-brand-red"
    },
    {
        id: "removal-estimator",
        name: "Laser Removal Simulator",
        desc: "Calculate standard Fitzpatrick sessions needed to decompose specific pigment densities.",
        icon: <Zap className="w-7 h-7" />,
        href: "/tools/removal-estimator",
        tag: "REVERSAL",
        color: "bg-brand-red"
    }
];

export default function ToolsDirectoryPage() {
    return (
        <div className="min-h-screen bg-white text-black selection:bg-brand-red selection:text-white">
            
            {/* ULTRA-COMPACT HERO HEADER */}
            <section className="max-w-[1280px] mx-auto px-4 md:px-6 pt-10 md:pt-12 pb-8 border-b border-gray-light">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-16">
                    <div className="flex-1">
                        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-red mb-3 flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-brand-red animate-pulse" />
                            UTILITY MODULES
                        </div>
                        <h1 className="font-display text-[40px] md:text-[56px] leading-[0.95] tracking-tighter uppercase text-black">
                            INTELLIGENCE <br className="hidden md:block"/>SUITE
                        </h1>
                    </div>
                    
                    <div className="flex-1 max-w-[450px] pb-1">
                        <p className="font-sans text-[14px] md:text-[15px] text-gray-mid leading-relaxed font-normal">
                            Precision calculation tools mapping anatomical data, biological healing timelines, and market value to de-risk your investment.
                        </p>
                    </div>
                </div>
            </section>

            {/* GRID INTERFACE - MINIMAL PADDING TO FORCE CONTENT ABOVE FOLD */}
            <main className="max-w-[1280px] mx-auto px-4 md:px-6 pt-8 pb-24">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                    {TOOL_DIRECTORY.map((tool) => (
                        <Link 
                            key={tool.id} 
                            href={tool.href}
                            className="group bg-white border border-neutral-200 hover:border-black transition-all duration-300 p-6 flex flex-col h-full shadow-sm hover:shadow-xl relative"
                        >
                            {/* Compact accent tag */}
                            <div className="flex justify-between items-start mb-6">
                                <span className="font-mono text-[8px] tracking-widest font-bold uppercase border border-neutral-200 px-2 py-1 text-neutral-500 group-hover:text-black group-hover:border-black transition-colors">
                                    {tool.tag}
                                </span>
                                <ArrowUpRight className="w-4 h-4 text-neutral-300 group-hover:text-brand-red transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                            </div>

                            <div className="flex items-start gap-4 mb-4">
                                {/* Compact Icon frame */}
                                <div className={`w-12 h-12 flex-shrink-0 border border-black flex items-center justify-center transition-transform duration-300 bg-black text-white`}>
                                    {tool.icon}
                                </div>

                                {/* Info */}
                                <div>
                                    <h3 className="font-display text-[20px] md:text-[22px] uppercase tracking-tight leading-[1.1] mb-2 group-hover:text-brand-red transition-colors">
                                        {tool.name}
                                    </h3>
                                    <p className="font-sans text-[13px] text-neutral-500 leading-relaxed line-clamp-3 group-hover:text-black transition-colors">
                                        {tool.desc}
                                    </p>
                                </div>
                            </div>

                            {/* Compact Bottom indicator */}
                            <div className="mt-auto pt-4 border-t border-dotted border-neutral-200 flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${tool.color}`} />
                                <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 group-hover:text-black font-bold">Launch Utility →</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>

            {/* BOTTOM CTA */}
            <section className="max-w-[1280px] mx-auto px-4 md:px-6 mb-20">
                <div className="w-full bg-black text-white p-10 md:p-16 flex flex-col items-center text-center">
                    <h2 className="font-display text-[28px] md:text-[32px] uppercase tracking-tight mb-4 leading-none">Uncertain about the results?</h2>
                    <p className="text-neutral-400 text-[14px] max-w-[450px] mb-8 font-sans">Cross-reference your data simulations with validated empirical research in our Journal archive.</p>
                    <Link href="/blog" className="inline-block border border-white px-8 py-3.5 font-mono text-[11px] uppercase tracking-widest font-bold hover:bg-white hover:text-black transition-all duration-300">
                        Read Empirical Journal &rarr;
                    </Link>
                </div>
            </section>

        </div>
    );
}
