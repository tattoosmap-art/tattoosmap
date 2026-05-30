"use client";

import React from "react";
import { CheckCircle, Ruler, Zap, Layers } from "lucide-react";

interface ArtistSectionProps {
    minimumSizeCm: number | null;
    recommendedNeedle: string | null;
    artistTechnicalNotes: string | null;
    placementRecommendations: string[];
    agingPrediction: string | null;
    lineComplexity?: string;
}

const ArtistSection: React.FC<ArtistSectionProps> = ({
    minimumSizeCm,
    recommendedNeedle,
    artistTechnicalNotes,
    placementRecommendations,
    agingPrediction,
    lineComplexity = "Fine / Multi-layer",
}) => {
    const hasPlacement = placementRecommendations.length > 0;
    const tabs = hasPlacement ? (["ARTIST BRIEF", "PLACEMENT GUIDE"] as const) : (["ARTIST BRIEF"] as const);
    type Tab = typeof tabs[number];
    const [activeTab, setActiveTab] = React.useState<Tab>("ARTIST BRIEF");

    // Derive a needle detail string from the needle recommendation
    const needleDetail = recommendedNeedle 
        ? `${recommendedNeedle}`
        : "3RL / 1RL Detail";

    return (
        <div className="border border-neutral-200 bg-white">
            {/* ── Header Row ─────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
                <h2 className="font-display text-[22px] text-black">Artist</h2>
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-brand-red border border-brand-red px-2 py-1">
                    PRO
                </span>
            </div>

            {/* ── Two-Column Body ─────────────────────────────── */}
            <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-neutral-200">

                {/* Left — Specs Table */}
                <div className="w-full lg:w-[40%] px-6 py-6 flex flex-col gap-5">
                    <div className="flex flex-col gap-4">
                        <SpecRow
                            icon={<Ruler className="w-3.5 h-3.5" />}
                            label="Minimum Size"
                            value={minimumSizeCm ? `${minimumSizeCm} cm` : "—"}
                        />
                        <SpecRow
                            icon={<Zap className="w-3.5 h-3.5" />}
                            label="Needle Config"
                            value={needleDetail}
                        />
                        <SpecRow
                            icon={<Layers className="w-3.5 h-3.5" />}
                            label="Line Complexity"
                            value={lineComplexity}
                        />
                        <SpecRow
                            icon={<CheckCircle className="w-3.5 h-3.5" />}
                            label="Technique"
                            value="Fine Line / Stipple"
                        />
                    </div>
                </div>


                {/* Right — Tabs + Content */}
                <div className="w-full lg:w-[60%] flex flex-col">
                    {/* Tab Bar */}
                    <div className="flex border-b border-neutral-200">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-4 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors cursor-pointer ${
                                    activeTab === tab
                                        ? "bg-white text-black border-b-2 border-black -mb-px"
                                        : "bg-neutral-50 text-neutral-400 hover:text-black"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="px-6 py-6 flex-1">
                        {activeTab === "ARTIST BRIEF" && (
                            <div className="flex flex-col gap-6">
                                <div>
                                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 block mb-3">
                                        Technician's Notes
                                    </span>
                                    <p className="text-[14px] text-black leading-relaxed">
                                        {artistTechnicalNotes || "Technical parameters for this design are being reviewed by our artist community."}
                                    </p>
                                </div>

                                {agingPrediction && (
                                    <div className="pt-4 border-t border-neutral-100">
                                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 block mb-3">
                                            Longevity Forecast
                                        </span>
                                        <p className="text-[13px] text-neutral-600 leading-relaxed italic">
                                            {agingPrediction}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "PLACEMENT GUIDE" && (
                            <div className="flex flex-col gap-4">
                                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 block">
                                    Placement Recommendations
                                </span>
                                <ul className="flex flex-col gap-3">
                                    {placementRecommendations.length > 0
                                        ? placementRecommendations.map((rec, idx) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                <span className="mt-0.5 flex-shrink-0 w-5 h-5 bg-black text-white flex items-center justify-center text-[10px] font-mono">
                                                    {idx + 1}
                                                </span>
                                                <span className="text-[14px] text-black leading-relaxed">{rec}</span>
                                            </li>
                                        ))
                                        : (
                                            <li className="text-[14px] text-neutral-400 italic">Placement guide coming soon.</li>
                                        )
                                    }
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Small helper
const SpecRow = ({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) => (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-neutral-100 last:border-0">
        <div className="flex items-center gap-2 text-neutral-400">
            {icon}
            <span className="font-mono text-[12px] uppercase tracking-[0.08em]">{label}</span>
        </div>
        <span className="font-mono text-[13px] text-black font-medium">{value}</span>
    </div>
);

export default ArtistSection;
