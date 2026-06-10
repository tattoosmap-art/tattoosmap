"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { useModal } from "@/context/ModalContext";
import { useToast } from "@/components/ui/Toast";
import { supabase } from "@/lib/supabase";
import { downloadImage } from "@/lib/downloadImage";

import { trackDownloadAction } from "@/actions/trackDownload";

interface DownloadButtonProps {
    imageUrl: string;
    designTitle: string;
    designSlug: string;
}

export default function DownloadButton({ imageUrl, designTitle, designSlug }: DownloadButtonProps) {
    const { openLoginModal } = useModal();
    const { showToast } = useToast();
    const [user, setUser] = useState<any>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });
    }, []);

    const handleDownload = async () => {
        if (!user) {
            openLoginModal();
            return;
        }

        setIsDownloading(true);
        showToast("VERIFYING QUOTA...");

        try {
            const result = await trackDownloadAction(designSlug);
            
            if (!result.success) {
                if (result.reason === 'limit_reached') {
                    showToast("DAILY LIMIT REACHED (5/5)");
                } else if (result.reason === 'unauthorized') {
                    openLoginModal();
                } else {
                    showToast("ERROR CHECKING LIMIT");
                }
                return;
            }

            showToast(`PREPARING DOWNLOAD (${result.remaining} LEFT TODAY)`);
            await downloadImage(imageUrl, designTitle);
            showToast("DOWNLOAD COMPLETE");
        } catch (err) {
            console.error("Download failed:", err);
            showToast("DOWNLOAD FAILED — TRY AGAIN");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full h-[48px] bg-off-white text-black border border-black text-[13px] uppercase font-mono tracking-[0.08em] hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2 rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Download className="w-4 h-4" strokeWidth={1.5} />
            {isDownloading ? "Preparing..." : "Download"}
        </button>
    );
}
