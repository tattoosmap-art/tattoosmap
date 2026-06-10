"use client";

import { Share2, Bookmark, Check } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Post } from "@/types/database.types";
import { useAuth } from "@/context/AuthContext";
import { useModal } from "@/context/ModalContext";
import { getSavedPostIds, toggleSavePost } from "@/lib/saves";

interface BlogMetaBarProps {
    post: Post;
}

export default function BlogMetaBar({ post }: BlogMetaBarProps) {
    const [isSaved, setIsSaved] = useState(false);
    const [isShared, setIsShared] = useState(false);
    const { user } = useAuth();
    const { openLoginModal } = useModal();

    useEffect(() => {
        if (user) {
            const savedIds = getSavedPostIds(user.id);
            setIsSaved(savedIds.includes(post.id));
        }
    }, [user, post.id]);

    const handleShare = async () => {
        if (typeof navigator === 'undefined') return;

        // Always copy to clipboard for a reliable one-click experience
        try {
            await navigator.clipboard.writeText(window.location.href);
            setIsShared(true);
            setTimeout(() => setIsShared(false), 2000);
        } catch (err) {
            console.error("Clipboard error:", err);
        }

        // Also trigger native share if available (best for mobile)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: post.title,
                    text: post.excerpt,
                    url: window.location.href,
                });
            } catch (err) {
                // Ignore AbortError (user cancelled)
                if ((err as Error).name !== 'AbortError') {
                    console.error("Native share error:", err);
                }
            }
        }
    };

    const handleSave = () => {
        if (!user) {
            openLoginModal();
            return;
        }

        const nowSaved = toggleSavePost(user.id, post.id);
        setIsSaved(nowSaved);
    };

    const formattedDate = new Date(post.published_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="w-full border-b border-gray-light bg-off-white/50">
            <div className="max-w-[1280px] mx-auto px-4 md:px-6 h-[80px] flex items-center justify-between">
                
                {/* Author & Info */}
                <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white border border-gray-light">
                        <Image 
                            src="/brand-logo.png"
                            alt="TattoosMap Logo"
                            fill
                            className="object-contain"
                            sizes="48px"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[14px] text-black font-medium">TattoosMap</span>
                        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-gray-mid">
                            {formattedDate} · {post.read_time_minutes} MIN READ
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleShare}
                        className={`p-3 transition-colors rounded-full ${isShared ? 'text-brand-red' : 'text-black hover:bg-gray-light'}`}
                        aria-label="Share"
                    >
                        {isShared ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5 stroke-[1.5]" />}
                    </button>
                    <button 
                        onClick={handleSave}
                        className={`p-3 transition-colors rounded-full ${isSaved ? 'text-brand-red' : 'text-black hover:bg-gray-light'}`}
                        aria-label="Save"
                    >
                        <Bookmark className={`w-5 h-5 stroke-[1.5] ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                </div>

            </div>
        </div>
    );
}
