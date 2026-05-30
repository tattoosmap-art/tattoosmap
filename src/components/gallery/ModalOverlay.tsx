"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

export default function ModalOverlay({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    // Prevent body scroll when intercept window is open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    return (
        <div data-lenis-prevent="true" className="fixed inset-0 z-40 bg-white overflow-y-auto no-scrollbar animate-in fade-in duration-300">
            {/* 73px physical offset matching the site header */}
            <div className="h-[73px] w-full shrink-0 bg-transparent" aria-hidden="true" />
            
            {/* Header / Back Navigation with z-[60] to mathematically ensure the z-50 site Header never hides it */}
            <div className="sticky top-[73px] z-[60] bg-white/80 backdrop-blur-md border-b border-gray-light px-4 md:px-6 py-4 flex items-center">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-light bg-off-white text-[11px] font-mono uppercase tracking-widest text-black hover:bg-black hover:text-white transition-colors active:scale-[0.98]"
                    aria-label="Back to explore"
                >
                    <ArrowLeft className="w-4 h-4" /> BACK TO EXPLORE
                </button>
            </div>
            
            {/* Full-bleed Content Container */}
            <div className="w-full flex justify-center pb-24">
                {children}
            </div>
        </div>
    );
}
