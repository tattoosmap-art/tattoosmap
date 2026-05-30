"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Trash2, ShieldAlert, X, Edit3 } from "lucide-react";
import { EditDesignModal } from "./EditDesignModal";
import { revalidateDesignPath, toggleDesignPublishAction, togglePostPublishAction, permanentDeleteAction } from "@/actions/admin";

interface AdminControlsProps {
    type: "post" | "design";
    id: string;
    isPublished: boolean;
    isDeleted: boolean;
    imageUrl?: string;
    title?: string;
    slug?: string;
    artistName?: string;
    altText?: string;
    // Blog Specific (Preserved interface signature)
    excerpt?: string;
    bodyContent?: string;
    category?: string;
    tags?: string;
    readTimeMinutes?: number;
    focusKeyword?: string;
    metaTitle?: string;
    schemaType?: string;
    relatedDesigns?: any[];
}

export function AdminControls({ 
    type, id, isPublished, isDeleted, imageUrl, title, slug, artistName, altText,
    excerpt, bodyContent, category, tags, readTimeMinutes,
    focusKeyword, metaTitle, schemaType, relatedDesigns
}: AdminControlsProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [isActionLoading, setIsActionLoading] = useState(false);

    const table = type === "post" ? "posts" : "designs";
    const subjectTruncated = (title || "Untitled").substring(0, 30) + ((title || "").length > 30 ? "..." : "");

    const triggerRefresh = () => {
        window.dispatchEvent(new CustomEvent("content-updated"));
    };

    // 1. Toggle Publish/Archive
    const handleTogglePublish = async () => {
        setIsActionLoading(true);
        const newStatus = !isPublished;
        
        // Optimistic event dispatch
        window.dispatchEvent(new CustomEvent("trigger-status-toast", {
            detail: { id, isPublished: newStatus, subject: subjectTruncated }
        }));

        const result = type === "design" 
            ? await toggleDesignPublishAction(id, newStatus)
            : await togglePostPublishAction(id, newStatus);

        if (result.success) {
            triggerRefresh();
        } else {
            console.error("Toggle failed:", result.error);
            alert("Failed to update status: " + result.error);
            triggerRefresh();
        }
        
        setIsActionLoading(false);
    };

    // 2. Permanent Delete + Storage Cleanup
    const handlePermanentDelete = async () => {
        setIsActionLoading(true);
        try {
        const result = await permanentDeleteAction(type, [id]);
        if (result.success) {
            setIsModalOpen(false);
            triggerRefresh();
        } else {
            console.error("Permanent delete failed:", result.error);
            alert("Permanent deletion failed: " + result.error);
        }
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleEditClick = () => {
        if (type === "design") {
            setIsEditModalOpen(true);
        } else {
            // Seamless redirection directly to the premium publisher editor in isolated window
            window.open(`/admin/publish?edit=${id}`, '_blank');
        }
    };

    return (
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-2">
            {/* Toggle Status */}
            {!isDeleted && (
                <button
                    onClick={handleTogglePublish}
                    disabled={isActionLoading}
                    className={`px-3 py-1 font-mono text-[11px] uppercase transition-colors ${
                        isPublished 
                        ? 'bg-transparent border border-neutral-300 text-black hover:bg-neutral-100' 
                        : 'bg-transparent border border-black text-black font-bold hover:bg-black hover:text-white'
                    }`}
                >
                    {isPublished ? "Archive" : "Set Public"}
                </button>
            )}

            {/* Permanent Delete Trigger (Trash Icon) */}
            <button
                onClick={() => setIsModalOpen(true)}
                disabled={isActionLoading}
                className="p-1 px-2 border border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                title="Permanent Delete"
            >
                <Trash2 className="w-4 h-4" />
            </button>
            
            {/* Edit Interaction */}
            {!isDeleted && (
                <button
                    onClick={handleEditClick}
                    disabled={isActionLoading}
                    className="p-1 px-2 border border-transparent hover:border-neutral-200 text-black transition-colors"
                    title={`Edit ${type === "design" ? "Design" : "Post"} Details`}
                >
                    <Edit3 className="w-4 h-4" />
                </button>
            )}

            {/* Verification Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-[440px] bg-white border border-red-500 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center justify-between">
                            <span className="font-mono text-[13px] uppercase text-brand-red flex items-center gap-2">
                                <Trash2 className="w-4 h-4" /> PERMANENT DESTRUCTION
                            </span>
                            <button onClick={() => setIsModalOpen(false)} className="text-red-400 hover:text-red-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {type === "design" && imageUrl && (
                                <div className="flex gap-4 mb-6 bg-off-white p-3 border border-neutral-200">
                                    <div className="w-[120px] h-[120px] relative bg-neutral-100 shrink-0">
                                        <img src={imageUrl} alt={altText} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex flex-col justify-center overflow-hidden">
                                        <span className="font-display text-[18px] text-black leading-tight truncate">{title || "Untitled"}</span>
                                        <span className="font-mono text-[11px] text-neutral-400 truncate mt-1">{slug}</span>
                                    </div>
                                </div>
                            )}

                            <div className="mb-6">
                                <p className="text-[14px] text-neutral-600 leading-relaxed font-sans">
                                    This will permanently delete {type === "design" ? "the image file from storage and remove " : ""}all database records. <strong className="text-black">This cannot be undone.</strong>
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block font-mono text-[11px] uppercase text-neutral-400 mb-2">
                                        TYPE DESTROY TO CONFIRM
                                    </label>
                                    <input
                                        type="text"
                                        value={confirmText}
                                        onChange={(e) => setConfirmText(e.target.value)}
                                        className="w-full border border-neutral-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-transparent outline-none px-4 py-3 font-mono text-[16px] text-black transition-all rounded-none uppercase"
                                        autoFocus
                                    />
                                </div>

                                <button
                                    onClick={handlePermanentDelete}
                                    disabled={confirmText !== "DESTROY" || isActionLoading}
                                    className="w-full py-4 font-mono text-[12px] uppercase tracking-widest transition-all focus:outline-none disabled:opacity-50 disabled:bg-neutral-200 disabled:text-neutral-500 disabled:cursor-not-allowed bg-brand-red text-white"
                                >
                                    {isActionLoading ? "Processing..." : "Confirm Destruction"}
                                </button>
                                
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-full py-3 bg-transparent border border-neutral-200 text-black font-mono text-[12px] uppercase tracking-widest hover:bg-neutral-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Design Modal */}
            {isEditModalOpen && (
                <EditDesignModal 
                    design={{
                        id,
                        title: title || "",
                        image_url: imageUrl || "",
                        artist_name: artistName || "",
                        alt_text: altText || "",
                        slug: slug || ""
                    }}
                    onClose={() => setIsEditModalOpen(false)}
                    onUpdate={triggerRefresh}
                />
            )}
        </div>
    );
}
