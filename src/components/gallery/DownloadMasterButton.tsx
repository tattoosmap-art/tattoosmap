"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { getMasterDownloadUrlAction } from "@/actions/getMasterDownloadUrl";

interface DownloadMasterButtonProps {
    designSlug: string;
}

export default function DownloadMasterButton({ designSlug }: DownloadMasterButtonProps) {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async () => {
        setIsLoading(true);
        showToast("GENERATING SECURE HQ LINK...");

        try {
            const result = await getMasterDownloadUrlAction(designSlug);
            
            if (result.error) {
                showToast(result.error);
                return;
            }

            if (result.url) {
                window.open(result.url, '_blank');
                showToast("HQ MASTER DOWNLOAD STARTED");
            }
        } catch (err) {
            console.error("Master download failed:", err);
            showToast("HQ DOWNLOAD FAILED");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={isLoading}
            className="w-full h-[48px] bg-black text-white border border-black text-[11px] md:text-[13px] uppercase font-mono tracking-[0.08em] hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 rounded-none disabled:opacity-50"
        >
            <ShieldCheck className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
            {isLoading ? "Generating..." : "High Quality Version"}
        </button>
    );
}
