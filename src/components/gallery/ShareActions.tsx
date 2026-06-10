"use client";

import { Share2, Link as LinkIcon, Check, MessageCircle, Facebook, Mail } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";

interface ShareActionsProps {
    title?: string;
    url?: string;
}

export default function ShareActions({ title, url }: ShareActionsProps) {
    const { showToast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const shareUrl = typeof window !== 'undefined' ? (url || window.location.href) : '';
    const shareTitle = title || "Check out this tattoo design on Tattoosmap";

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCopy = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            showToast("LINK COPIED TO CLIPBOARD");
            setTimeout(() => {
                setCopied(false);
                setIsOpen(false);
            }, 1500);
        } catch (err) {
            showToast("FAILED TO COPY LINK");
        }
    };

    const handleWhatsApp = (e: React.MouseEvent) => {
        e.preventDefault();
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ': ' + shareUrl)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
        setIsOpen(false);
    };

    const handleFacebook = (e: React.MouseEvent) => {
        e.preventDefault();
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(fbUrl, '_blank', 'noopener,noreferrer');
        setIsOpen(false);
    };

    const handleEmail = (e: React.MouseEvent) => {
        e.preventDefault();
        const mailUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent("Check this out: " + shareUrl)}`;
        window.open(mailUrl, '_self');
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-[48px] bg-off-white text-black border border-neutral-200 text-[13px] uppercase font-mono tracking-[0.08em] hover:border-black transition-colors flex items-center justify-center gap-2 rounded-none"
                type="button"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <Share2 className="w-4 h-4" strokeWidth={1.5} />
                Share
            </button>
            
            {isOpen && (
                <div className="absolute right-0 bottom-full mb-2 w-full min-w-[180px] bg-white border border-neutral-200 shadow-xl z-[999] flex flex-col font-mono text-[11px] uppercase tracking-wider animate-in fade-in slide-in-from-bottom-2 duration-200">
                    {/* Copy Link */}
                    <button
                        onClick={handleCopy}
                        className="w-full px-4 py-3.5 hover:bg-neutral-50 text-left flex items-center gap-3 text-black border-b border-neutral-100 transition-colors"
                        type="button"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-brand-red animate-pulse" strokeWidth={1.5} />
                                <span className="text-brand-red font-bold">Copied!</span>
                            </>
                        ) : (
                            <>
                                <LinkIcon className="w-3.5 h-3.5 text-neutral-500" strokeWidth={1.5} />
                                <span>Copy Link</span>
                            </>
                        )}
                    </button>

                    {/* WhatsApp */}
                    <button
                        onClick={handleWhatsApp}
                        className="w-full px-4 py-3.5 hover:bg-neutral-50 text-left flex items-center gap-3 text-black border-b border-neutral-100 transition-colors"
                        type="button"
                    >
                        <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" strokeWidth={1.5} />
                        <span>WhatsApp</span>
                    </button>

                    {/* Facebook */}
                    <button
                        onClick={handleFacebook}
                        className="w-full px-4 py-3.5 hover:bg-neutral-50 text-left flex items-center gap-3 text-black border-b border-neutral-100 transition-colors"
                        type="button"
                    >
                        <Facebook className="w-3.5 h-3.5 text-[#1877F2]" strokeWidth={1.5} />
                        <span>Facebook</span>
                    </button>

                    {/* Email */}
                    <button
                        onClick={handleEmail}
                        className="w-full px-4 py-3.5 hover:bg-neutral-50 text-left flex items-center gap-3 text-black transition-colors"
                        type="button"
                    >
                        <Mail className="w-3.5 h-3.5 text-neutral-500" strokeWidth={1.5} />
                        <span>Email</span>
                    </button>
                </div>
            )}
        </div>
    );
}
