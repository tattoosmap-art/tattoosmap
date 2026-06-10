"use client";

import React from "react";
import { Info } from "lucide-react";

interface PainMapProps {
    data: Record<string, 'low' | 'medium' | 'high'> | null;
}

const PainMap: React.FC<PainMapProps> = ({ data }) => {
    // Default fallback if no data provided
    const defaultMap: Record<string, 'low' | 'medium' | 'high'> = {
        "forearm_outer": "low",
        "forearm_inner": "medium",
        "upper_arm": "low",
        "shoulder": "low",
        "shoulder_blade": "medium",
        "chest": "high",
        "ribs": "high",
        "stomach": "medium",
        "wrist": "medium",
        "ankle": "high",
        "foot": "high",
        "behind_ear": "high",
        "neck": "high",
        "thigh": "low",
        "calf": "medium",
        "hands": "high",
        "inner_elbow": "high",
        "armpit": "high",
        "sternum": "high"
    };

    const painData = data || defaultMap;

    const getPainColor = (level: any) => {
        if (typeof level !== 'string') return 'bg-neutral-100 text-neutral-400 border-neutral-200';
        switch (level.toLowerCase()) {
            case 'low': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            case 'medium': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            case 'high': return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
            default: return 'bg-neutral-100 text-neutral-400 border-neutral-200';
        }
    };

    const formatLabel = (key: string) => {
        return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(painData).map(([part, level]) => (
                    <div 
                        key={part} 
                        className={`flex items-center justify-between px-4 py-3 border rounded-none text-[11px] font-mono uppercase tracking-[0.05em] ${getPainColor(level)}`}
                    >
                        <span>{formatLabel(part)}</span>
                        <span className="font-bold">{level}</span>
                    </div>
                ))}
            </div>

            <div className="flex items-start gap-3 p-4 bg-off-white border border-gray-light">
                <Info className="w-4 h-4 text-gray-mid mt-0.5" />
                <p className="text-[12px] text-gray-mid italic leading-relaxed">
                    Pain levels are subjective and vary by individual tolerance. These ratings reflect general consensus for fine-line application techniques.
                </p>
            </div>
        </div>
    );
};

export default PainMap;
