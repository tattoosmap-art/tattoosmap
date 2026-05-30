import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Info, Activity, Calculator, Map, Shield, Zap } from "lucide-react";

// STANDARD IMPORTS (Removes secondary client fetch, unlocking maximum load velocity via automatic Next.js code-splitting)
import CostCalculator from "@/components/blog/CostCalculator";
import PainMap from "@/components/gallery/PainMap";
import HealingTracker from "@/components/blog/HealingTracker";
import RemovalJourneyEstimator from "@/components/blog/RemovalJourneyEstimator";
import SkinCompatibilityChecker from "@/components/blog/SkinCompatibilityChecker";

// STATIC PARAMS FOR NEXT.JS OPTIMIZATION
export async function generateStaticParams() {
  return [
    { slug: "cost-estimator" },
    { slug: "pain-map" },
    { slug: "healing-tracker" },
    { slug: "skin-compatibility" },
    { slug: "removal-estimator" },
  ];
}

type ToolPageProps = {
    params: Promise<{ slug: string }>;
};

export default async function ToolDetailPage({ params }: ToolPageProps) {
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    // DATABASE OF DEFINITIONS MATCHING SLUGS
    const TOOL_CONFIG: Record<string, {
        title: string;
        description: string;
        icon: React.ReactNode;
        category: string;
        component: React.ReactNode;
    }> = {
        "cost-estimator": {
            title: "Tattoo Cost & Session Estimator",
            description: "Analytical tool to calculate realistic investment expectations based on global studio pricing algorithms and anatomical surface area.",
            icon: <Calculator className="w-5 h-5" />,
            category: "FINANCE & PLANNING",
            component: <CostCalculator />
        },
        "pain-map": {
            title: "Tattoo Pain Density Map",
            description: "A neurological guide to skin sensitivity variations across specific zones of the human anatomy.",
            icon: <Map className="w-5 h-5" />,
            category: "BIOLOGICAL PLACEMENT",
            component: <div className="bg-white p-8 border border-neutral-200 rounded-none"><PainMap data={null} /></div>
        },
        "healing-tracker": {
            title: "Aftercare Healing Day-Tracker",
            description: "Interactive projection of human tissue regeneration to monitor visual signs of standard and distressed recovery phases.",
            icon: <Activity className="w-5 h-5" />,
            category: "PHYSIOLOGICAL MONITORING",
            component: <HealingTracker />
        },
        "skin-compatibility": {
            title: "Product Ingredient Analyzer",
            description: "Verify clinical compatibility of your current skincare rotation against modern tattoo preservation protocols.",
            icon: <Shield className="w-5 h-5" />,
            category: "INGREDIENT SCIENCE",
            component: <SkinCompatibilityChecker />
        },
        "removal-estimator": {
            title: "Laser Removal Simulation Grid",
            description: "Forecast session density required to achieve zero-trace clearance based on ink depth metrics.",
            icon: <Zap className="w-5 h-5" />,
            category: "PIGMENT CORRECTION",
            component: <RemovalJourneyEstimator />
        }
    };

    const config = TOOL_CONFIG[slug];
    if (!config) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-[#F9F9F9] text-black pb-32">
            
            {/* STICKY SUB-HEADER */}
            <div className="sticky top-0 z-40 bg-white border-b border-neutral-200 px-4 md:px-6 py-4 flex items-center gap-4">
                <Link href="/tools" className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-neutral-500 hover:text-black transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Directory
                </Link>
                <div className="hidden md:flex items-center gap-2 text-neutral-300 font-mono text-[11px]">
                    <span>/</span>
                    <span className="text-black font-bold">Module: {slug}</span>
                </div>
            </div>

            <main className="max-w-[1000px] mx-auto px-4 md:px-6 pt-12 md:pt-16 flex flex-col gap-12">
                
                {/* HEADER SECTION (Streamlined sizing and padding for instant clarity) */}
                <header className="flex flex-col gap-5 border-b-[4px] border-black pb-8">
                    <div className="flex items-center gap-3">
                        <span className="bg-black text-white font-mono text-[10px] uppercase tracking-[0.2em] px-3 py-1 flex items-center gap-2 font-bold">
                            {config.icon}
                            {config.category}
                        </span>
                    </div>

                    <h1 className="font-display text-[32px] md:text-[56px] uppercase tracking-tighter leading-[1] text-black">
                        {config.title}
                    </h1>

                    <p className="font-sans text-[15px] md:text-[16px] text-gray-mid max-w-[600px] leading-relaxed">
                        {config.description}
                    </p>
                </header>

                {/* RENDER STAGE (Removed heavy motion class 'animate-in fade-in duration-700' for lightning speed feel) */}
                <section className="bg-white border border-neutral-200 shadow-xl p-6 md:p-12 relative overflow-hidden">
                    {/* Subtle utility accent mark */}
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-brand-red pointer-events-none opacity-50" />
                    <div>
                        {config.component}
                    </div>
                </section>

                {/* CONTEXTUAL NOTICE */}
                <div className="flex items-start gap-4 bg-neutral-100 p-6 border border-neutral-200">
                    <Info className="w-5 h-5 text-black shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                        <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-black">Operational Notice</span>
                        <p className="text-[12px] text-neutral-500 leading-relaxed italic">
                            Calculations generated on this node are theoretical simulations based on biological consensus data. Individual experience scales vary based on environmental and metabolic variables.
                        </p>
                    </div>
                </div>

                {/* PIVOT LINKS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Link href="/gallery" className="border border-neutral-200 bg-white p-8 hover:border-black transition-all duration-200 flex items-center justify-between group">
                        <div>
                            <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-1 block">Next Operation</span>
                            <h4 className="font-display text-[18px] uppercase tracking-tight text-black group-hover:text-brand-red transition-colors">Explore The Gallery</h4>
                        </div>
                        <ArrowLeft className="w-5 h-5 rotate-180 text-neutral-300 group-hover:text-black transition-all group-hover:translate-x-2" />
                    </Link>
                    <Link href="/blog" className="border border-neutral-200 bg-white p-8 hover:border-black transition-all duration-200 flex items-center justify-between group">
                        <div>
                            <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 mb-1 block">Reference</span>
                            <h4 className="font-display text-[18px] uppercase tracking-tight text-black group-hover:text-brand-red transition-colors">Read Methodology</h4>
                        </div>
                        <ArrowLeft className="w-5 h-5 rotate-180 text-neutral-300 group-hover:text-black transition-all group-hover:translate-x-2" />
                    </Link>
                </div>
            </main>
        </div>
    );
}
