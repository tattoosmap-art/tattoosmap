"use client";

import Image from "next/image";
import { useState } from "react";
import { deleteProductAction } from "@/actions/admin";

import { AlertTriangle } from "lucide-react";

type DBProduct = {
    id: string;
    name: string;
    price?: string;
    affiliate_url?: string;
    image_url?: string;
    button_label?: string;
    tag?: string;
    category?: string;
    source_post_slug?: string;
};

export function ProductCard({ product, isAdmin }: { product: DBProduct, isAdmin?: boolean }) {
    const hasImageUrl = product.image_url && product.image_url.startsWith('http');
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowConfirm(true);
    };

    const confirmDelete = async () => {
        setShowConfirm(false);
        setIsDeleting(true);
        await deleteProductAction(product.id);
        setIsDeleting(false);
    };

    if (isDeleting) return <div className="group flex flex-col h-full bg-white relative animate-pulse opacity-50 min-h-[400px]" />;

    return (
        <>
            {/* Custom High-End Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setShowConfirm(false)}
                    />
                    
                    {/* Dialog Card */}
                    <div className="relative bg-white border border-neutral-100 w-full max-w-[420px] p-8 md:p-10 text-center shadow-2xl shadow-black/30 flex flex-col items-center transform transition-all duration-300 ease-out scale-100 select-none">
                        <div className="w-14 h-14 rounded-full bg-red-50 text-brand-red flex items-center justify-center mb-6 border border-red-100">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        
                        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-bold mb-3">
                            Administrative Action
                        </span>
                        
                        <h2 className="font-display text-[24px] leading-tight text-black mb-4">
                            Permanently delete <br />
                            <span className="text-brand-red font-sans text-[19px] font-bold tracking-tight">"{product.name}"</span>?
                        </h2>
                        
                        <p className="font-sans text-[13px] text-neutral-500 mb-8 leading-relaxed max-w-[300px]">
                            This operation is immediate and irreversible. The item will be purged from the collection database.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-3 w-full">
                            <button 
                                onClick={() => setShowConfirm(false)}
                                className="border border-neutral-200 py-3.5 font-mono text-[11px] uppercase tracking-widest text-neutral-500 hover:text-black hover:border-black bg-white transition-all cursor-pointer font-bold"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDelete}
                                className="bg-black text-white hover:bg-brand-red py-3.5 font-mono text-[11px] uppercase tracking-widest transition-all cursor-pointer font-bold shadow-lg shadow-black/10"
                            >
                                Delete Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="group flex flex-col h-full bg-white relative">
            {isAdmin && (
                <button 
                    onClick={handleDeleteClick}
                    className="absolute top-2 right-2 z-20 bg-white/90 text-brand-red hover:bg-brand-red hover:text-white p-2 rounded-full shadow-sm transition-colors cursor-pointer"
                    title="Delete Product"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            )}
            {/* Architectural Visual Frame */}
            <div className="w-full aspect-[4/5] relative overflow-hidden flex items-center justify-center bg-[#FAFAFA] transition-all duration-700 group-hover:bg-white border border-[#F0F0F0] group-hover:border-neutral-200">
                
                {hasImageUrl ? (
                    <div className="relative w-[80%] h-[80%] transition-all duration-700 group-hover:scale-[1.04] ease-[cubic-bezier(0.23,1,0.32,1)]">
                        <Image
                            src={product.image_url!}
                            alt={product.name}
                            fill
                            className="object-contain mix-blend-multiply"
                            sizes="(max-width: 768px) 50vw, 33vw"
                        />
                    </div>
                ) : (
                    <div className="text-neutral-300 font-mono text-[10px] uppercase tracking-widest border border-dashed border-neutral-200 px-4 py-2">
                        No Image
                    </div>
                )}

                {/* Immediate Interaction Overlay (reveals on hover) - DESKTOP ONLY */}
                <div className="hidden md:flex absolute inset-x-0 bottom-0 flex-col gap-1.5 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-30 bg-gradient-to-t from-white/95 via-white/80 to-transparent">
                    <a
                        href={product.affiliate_url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-black text-white font-mono text-[11px] font-bold uppercase tracking-widest text-center py-3.5 hover:bg-brand-red transition-colors shadow-lg flex items-center justify-center gap-2"
                    >
                        {product.button_label || 'BUY NOW'}
                    </a>
                    {product.source_post_slug && (
                        <a
                            href={`/blog/${product.source_post_slug}#${product.name?.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').substring(0, 80)}`}
                            className="w-full bg-white border border-black/10 text-black font-mono text-[10px] uppercase tracking-widest text-center py-3 hover:border-black hover:bg-black hover:text-white transition-all"
                        >
                            READ REVIEW
                        </a>
                    )}
                </div>
            </div>

            {/* Informational Footer (Fixed below image) */}
            <div className="pt-5 pb-2 flex flex-col flex-grow bg-white transition-all duration-500 group-hover:px-1">
                <div className="flex items-baseline justify-between gap-4 mb-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-400 font-medium truncate">
                        {product.category || 'Ink & Gear'}
                    </span>
                    {product.price && (
                        <span className="font-mono text-[13px] font-bold text-black shrink-0">
                            {product.price.includes('$') ? product.price : `$${product.price}`}
                        </span>
                    )}
                </div>
                
                <h3 className="font-display text-[18px] leading-[1.3] text-black line-clamp-2 transition-colors duration-300 group-hover:text-brand-red">
                    {product.name}
                </h3>
                
                {/* Decorative line reveals only on group-hover */}
                <div className="w-full h-[1px] bg-black origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 mt-4 opacity-20" />
                
                {/* Mobile/Tablet Action Buttons - Static & Persistent for touch layouts */}
                <div className="flex md:hidden flex-col gap-1.5 mt-5">
                    <a
                        href={product.affiliate_url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-black text-white font-mono text-[11px] font-bold uppercase tracking-widest text-center py-3 hover:bg-brand-red transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                        {product.button_label || 'BUY NOW'}
                    </a>
                    {product.source_post_slug && (
                        <a
                            href={`/blog/${product.source_post_slug}#${product.name?.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').substring(0, 80)}`}
                            className="w-full bg-white border border-black text-black font-mono text-[10px] uppercase tracking-widest text-center py-2.5 transition-all mt-0.5"
                        >
                            READ REVIEW
                        </a>
                    )}
                </div>
            </div>
        </div>
        </>
    );
}
