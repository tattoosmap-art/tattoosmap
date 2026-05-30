"use client";

import { useState, useEffect } from "react";
import { Bookmark, Loader2 } from "lucide-react";
import { useModal } from "@/context/ModalContext";
import { useAuth } from "@/context/AuthContext";
import { toggleDefaultSave, checkIsSaved } from "@/actions/collections";
import { useToast } from "@/components/ui/Toast";

interface SaveButtonProps {
    designId: string;
    saveCount: number;
    viewCount: number;
}

export default function SaveButton({ designId, saveCount, viewCount }: SaveButtonProps) {
    const { openLoginModal } = useModal();
    const { user } = useAuth();
    const { showToast } = useToast();
    
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [localSaveCount, setLocalSaveCount] = useState(saveCount);

    // Initial check
    useEffect(() => {
        if (user) {
            checkIsSaved(designId).then(res => setIsSaved(res.isSaved));
        }
    }, [user, designId]);

    const handleAction = async () => {
        if (!user) {
            openLoginModal();
            return;
        }

        setIsLoading(true);
        const res = await toggleDefaultSave(designId);
        setIsLoading(false);

        if (res.error) {
            showToast(res.error);
        } else if (res.success) {
            setIsSaved(res.isSaved);
            setLocalSaveCount(prev => res.isSaved ? prev + 1 : Math.max(0, prev - 1));
            showToast(res.isSaved ? "Saved to your archive" : "Removed from archive");
        }
    };

    return (
        <div className="pt-6 border-t border-gray-light flex flex-col gap-4 relative">
            <button
                onClick={handleAction}
                disabled={isLoading}
                className={`w-full h-[56px] text-[14px] uppercase font-mono tracking-[0.08em] transition-colors flex items-center justify-center gap-2 rounded-none disabled:opacity-70 ${
                    isSaved
                    ? "bg-brand-red text-white hover:bg-black"
                    : "bg-black text-white hover:bg-brand-red"
                    }`}
            >
                {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <Bookmark className="w-5 h-5" strokeWidth={1.5} fill={isSaved ? "currentColor" : "none"} />
                )}
                {isSaved ? "Saved" : "Save Design"}
            </button>
            
        </div>
    );
}
