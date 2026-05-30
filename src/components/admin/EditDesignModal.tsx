"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { X, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { Design } from "@/types/database.types";
import { updateDesignAction } from "@/actions/admin";

interface EditDesignModalProps {
    design: {
        id: string;
        title: string | null;
        image_url: string;
        artist_name: string;
        alt_text: string;
        slug: string;
    };
    onClose: () => void;
    onUpdate: () => void;
}

export function EditDesignModal({ design, onClose, onUpdate }: EditDesignModalProps) {
    const [title, setTitle] = useState(design.title || "");
    const [artistName, setArtistName] = useState(design.artist_name || "");
    const [altText, setAltText] = useState(design.alt_text || "");
    const [newFile, setNewFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("id", design.id);
            formData.append("subject", title); // Map UI 'title' to DB 'subject'
            formData.append("alt_text", altText);
            formData.append("slug", design.slug);
            formData.append("current_image_url", design.image_url);
            
            if (newFile) {
                formData.append("image", newFile);
            }

            // Update DB record via Server Action (handles image upload & revalidation)
            const result = await updateDesignAction(formData);

            if (!result.success) throw new Error(result.error);

            onUpdate();
            onClose();
        } catch (err) {
            console.error("Update failed:", err);
            alert("Update failed. Check console for details.");
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            {/* Fix 3: Reinforced Dark Overlay */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative w-full max-w-[500px] max-h-[90vh] overflow-y-auto bg-white border border-neutral-200 p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 scrollbar-hide">
                {/* Fix 1: Restored Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-black hover:text-brand-red transition-colors z-20"
                    aria-label="Close modal"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-6">
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-red mb-2 block">Design Editor</span>
                    <h3 className="font-display text-[24px] md:text-[28px] leading-tight text-black uppercase tracking-tight">Update Content.</h3>
                </div>

                <div className="space-y-5">
                    {/* Image Upload Area */}
                    <div className="group relative aspect-[16/6] bg-off-white border border-dashed border-gray-light hover:border-black transition-colors overflow-hidden">
                        {(previewUrl || design.image_url) && (
                            <img 
                                src={previewUrl || design.image_url} 
                                alt="Preview" 
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                        )}
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/5 group-hover:bg-black/20 transition-colors"
                        >
                            <Upload className="w-5 h-5 mb-1 text-black" />
                            <span className="font-mono text-[9px] uppercase tracking-widest text-black font-bold">Replace Image</span>
                        </button>
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleFileChange}
                        />
                    </div>

                    <div className="flex flex-col gap-6">
                        {/* Title Input */}
                        <div className="flex flex-col gap-1.5">
                            <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">Title</label>
                            <input 
                                type="text" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full border-b-2 border-neutral-200 focus:border-black bg-transparent outline-none pb-1.5 text-[16px] text-black font-medium transition-colors"
                                placeholder="Enter design subject..."
                            />
                            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mt-1">
                                LINKED ARTIST: <span className="text-black font-bold">{design.artist_name || 'None assigned'}</span>
                            </p>
                        </div>

                        {/* Alt Text Input */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-end">
                                <label className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">Alt Text (SEO)</label>
                                <span className={`font-mono text-[9px] uppercase tracking-widest ${altText.length > 125 ? 'text-amber-600 font-bold' : 'text-gray-mid'}`}>
                                    {altText.length} / 125
                                </span>
                            </div>
                            <textarea 
                                rows={3}
                                value={altText}
                                onChange={(e) => setAltText(e.target.value)}
                                className="w-full border border-neutral-200 focus:border-black bg-off-white outline-none p-3 text-[13px] text-black transition-colors resize-none leading-relaxed"
                                placeholder="Describe the design..."
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-light flex flex-col gap-3">
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full py-4 bg-black text-white font-mono text-[11px] uppercase tracking-widest hover:bg-brand-red transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Synchronizing...
                                </>
                            ) : (
                                "Update Global Record"
                            )}
                        </button>
                        <p className="text-[10px] text-gray-mid font-mono text-center uppercase tracking-widest">
                            Changes sync globally on revalidation.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
