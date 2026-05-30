"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Search, X, Check, ShieldAlert, Trash2 } from "lucide-react";
import { Design } from "@/types/database.types";
import { AdminControls } from "@/components/admin/AdminControls";
import { supabase } from "@/lib/supabase";
import { revalidateDesignPath, batchTogglePublishAction, permanentDeleteAction } from "@/actions/admin";

interface DesignManagerProps {
    designs: Design[];
}

export function DesignManager({ designs }: DesignManagerProps) {
    const [clientDesigns, setClientDesigns] = useState<Design[]>(designs);
    
    // Sync with server strictly unless animating
    useEffect(() => {
        setClientDesigns(designs);
    }, [designs]);

    const [displayTerm, setDisplayTerm] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    
    // Tab State
    const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

    // Batch Selection
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showBatchDestroyModal, setShowBatchDestroyModal] = useState(false);
    const [batchDestroyConfirm, setBatchDestroyConfirm] = useState("");
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Toast
    const [activeToast, setActiveToast] = useState<{
        id: string;
        message: string;
        hasUndo: boolean;
        undoAction?: () => void;
        timeoutId: NodeJS.Timeout;
    } | null>(null);

    // 1. Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchTerm(displayTerm);
        }, 150);
        return () => clearTimeout(timer);
    }, [displayTerm]);

    // 2. Global Event Listeners for Optimistic UI & Toasts
    useEffect(() => {
        const handleStatusToggle = (e: any) => {
            const { id, isPublished, subject } = e.detail;
            
            // Optimistic Client Update
            setClientDesigns(prev => prev.map(d => d.id === id ? { ...d, is_published: isPublished } : d));
            
            setActiveToast(prev => {
                if (prev) clearTimeout(prev.timeoutId);
                const timeoutId = setTimeout(() => setActiveToast(null), 5000);
                
                return {
                    id: `status-${id}`,
                    message: isPublished ? `DESIGN IS NOW LIVE — ${subject}` : `DESIGN ARCHIVED — ${subject}`,
                    hasUndo: !isPublished, // Only undo for ARCHIVE to return it to active
                    undoAction: async () => {
                        setClientDesigns(pv => pv.map(d => d.id === id ? { ...d, is_published: true } : d));
                        await supabase.from("designs").update({ is_published: true }).eq("id", id);
                        clearTimeout(timeoutId);
                        setActiveToast(null);
                        window.dispatchEvent(new CustomEvent("content-updated"));
                    },
                    timeoutId
                };
            });
        };

        window.addEventListener("trigger-status-toast", handleStatusToggle);
        return () => {
            window.removeEventListener("trigger-status-toast", handleStatusToggle);
        };
    }, []);

    // 3. Filtering Algorithm
    const allFiltered = useMemo(() => {
        let base = clientDesigns.filter(d => !d.deleted_at);
        if (searchTerm.length >= 2) {
            const term = searchTerm.toLowerCase();
            return base.filter((d) => {
                const subject = (d.title || d.subject || "").toLowerCase();
                const slug = (d.slug || "").toLowerCase();
                const altText = (d.alt_text || "").toLowerCase();
                const category = (d.public_category || "").toLowerCase();
                return subject.includes(term) || slug.includes(term) || altText.includes(term) || category.includes(term);
            });
        }
        return base;
    }, [searchTerm, clientDesigns]);

    const activeList = allFiltered.filter(d => d.is_published);
    const archivedList = allFiltered.filter(d => !d.is_published);

    const currentList = activeTab === 'active' ? activeList : archivedList;

    // Selection Info
    const hasActiveSelections = Array.from(selectedIds).some(id => activeList.some(d => d.id === id));
    const hasArchivedSelections = Array.from(selectedIds).some(id => archivedList.some(d => d.id === id));

    const isSearching = searchTerm.length >= 2;

    const triggerRefresh = () => window.dispatchEvent(new CustomEvent("content-updated"));

    // Handlers
    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const handleSelectAll = () => {
        const newSet = new Set<string>();
        currentList.forEach(d => newSet.add(d.id));
        setSelectedIds(newSet);
    };

    const handleBatchArchive = async () => {
        const ids = Array.from(selectedIds).filter(id => activeList.some(d => d.id === id));
        if (ids.length === 0) return;
        
        setClientDesigns(prev => prev.map(d => ids.includes(d.id) ? { ...d, is_published: false } : d));

        await batchTogglePublishAction('design', ids, false);
        
        setActiveToast(prev => {
            if (prev) clearTimeout(prev.timeoutId);
            const timeoutId = setTimeout(() => setActiveToast(null), 5000);
            return {
                id: `batch-${Date.now()}`,
                message: `${ids.length} DESIGNS ARCHIVED`,
                hasUndo: true,
                undoAction: async () => {
                    setClientDesigns(pv => pv.map(d => ids.includes(d.id) ? { ...d, is_published: true } : d));
                    await batchTogglePublishAction('design', ids, true);
                    clearTimeout(timeoutId);
                    setActiveToast(null);
                    triggerRefresh();
                },
                timeoutId
            };
        });
        
        setSelectedIds(new Set());
        triggerRefresh();
    };

    const handleBatchSetPublic = async () => {
        const ids = Array.from(selectedIds).filter(id => archivedList.some(d => d.id === id));
        if (ids.length === 0) return;
        
        setClientDesigns(prev => prev.map(d => ids.includes(d.id) ? { ...d, is_published: true } : d));
        await batchTogglePublishAction('design', ids, true);
        
        setActiveToast(prev => {
            if (prev) clearTimeout(prev.timeoutId);
            const timeoutId = setTimeout(() => setActiveToast(null), 5000);
            return {
                id: `batch-public-${Date.now()}`,
                message: `${ids.length} DESIGNS ARE NOW LIVE`,
                hasUndo: false,
                timeoutId
            };
        });
        
        setSelectedIds(new Set());
        triggerRefresh();
    };

    const handleBatchDestroy = async () => {
        setIsActionLoading(true);
        const idsArray = Array.from(selectedIds);
        
        await permanentDeleteAction('design', idsArray);
        
        setShowBatchDestroyModal(false);
        setBatchDestroyConfirm("");
        setSelectedIds(new Set());
        setIsActionLoading(false);
        triggerRefresh();
    };

    const [visibleCount, setVisibleCount] = useState(8);

    const visibleList = useMemo(() => {
        // If user is active searching, yield all results. Otherwise clamp to visible window.
        if (searchTerm.length >= 2) return currentList;
        return currentList.slice(0, visibleCount);
    }, [currentList, visibleCount, searchTerm]);

    const hasMore = currentList.length > visibleList.length;

    // Card Renderer
    const renderDesignCard = (design: Design) => {
        const isArchived = !design.is_published;
        const isSelected = selectedIds.has(design.id);
        const anySelected = selectedIds.size > 0;

        return (
            <div key={design.id} className="group border border-neutral-200 p-4 hover:border-black transition-all relative animate-in fade-in duration-300">
                <div className={`absolute top-6 left-6 z-[20] ${isSelected || anySelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                    <button 
                        onClick={() => toggleSelection(design.id)}
                        className={`w-4 h-4 flex items-center justify-center transition-colors ${isSelected ? 'bg-black border border-black' : 'bg-transparent border border-neutral-300 bg-white/50 backdrop-blur-sm hover:border-black'}`}
                    >
                        {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </button>
                </div>

                <div className="aspect-[4/5] relative mb-4 overflow-hidden outline outline-1 outline-neutral-200 bg-off-white">
                    <Image
                        src={design.image_url}
                        alt={design.alt_text}
                        fill
                        className={`object-cover transition-opacity duration-300 ${isArchived ? 'opacity-40' : 'opacity-100'}`}
                    />
                    
                    {isArchived && (
                        <div className="absolute inset-0 pointer-events-none opacity-50" 
                             style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, #e5e5e5 8px, #e5e5e5 10px)' }} 
                        />
                    )}

                    <div className="absolute top-2 right-2 z-10">
                        {isArchived && (
                            <span className="bg-neutral-100 text-neutral-500 border border-neutral-300 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest">ARCHIVED</span>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-1 mb-4">
                    <span className="font-display text-[16px] text-black truncate">{design.title || design.subject || "Untitled Design"}</span>
                    <span className="font-mono text-[10px] text-gray-mid uppercase tracking-widest truncate">{design.slug}</span>
                </div>
                
                <div className="pt-4 border-t border-gray-light flex justify-end">
                    <AdminControls
                        type="design"
                        id={design.id}
                        isPublished={design.is_published}
                        isDeleted={!!design.deleted_at}
                        imageUrl={design.image_url}
                        title={design.title || design.subject || ""}
                        slug={design.slug}
                        artistName={design.artist_name || "Resident Artist"}
                        altText={design.alt_text}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-8 pb-32">
            
            {/* Tab Menu UI */}
            <div className="flex gap-8 border-b border-neutral-200">
                <button 
                    onClick={() => {
                        setActiveTab('active');
                        setVisibleCount(8);
                    }}
                    className={`pb-4 font-mono text-[13px] uppercase tracking-widest transition-all relative ${
                        activeTab === 'active' ? 'text-black font-bold' : 'text-neutral-400 hover:text-black'
                    }`}
                >
                    Active Designs ({activeList.length})
                    {activeTab === 'active' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />}
                </button>
                <button 
                    onClick={() => {
                        setActiveTab('archived');
                        setVisibleCount(8);
                    }}
                    className={`pb-4 font-mono text-[13px] uppercase tracking-widest transition-all relative ${
                        activeTab === 'archived' ? 'text-black font-bold' : 'text-neutral-400 hover:text-black'
                    }`}
                >
                    Archived Designs ({archivedList.length})
                    {activeTab === 'archived' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />}
                </button>
            </div>

            {/* Search Bar UI */}
            <div className="relative w-full group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-mid group-focus-within:text-black transition-colors">
                    <Search className="w-5 h-5" />
                </div>
                <input 
                    type="text" 
                    value={displayTerm}
                    onChange={(e) => setDisplayTerm(e.target.value)}
                    placeholder="Search designs by title, subject, or keyword..."
                    className="w-full bg-off-white border-b-2 border-gray-light focus:border-black outline-none py-6 pl-12 pr-12 font-mono text-[16px] transition-all placeholder:text-gray-mid"
                />
                {displayTerm.length > 0 && (
                    <button 
                        onClick={() => setDisplayTerm("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-mid hover:text-brand-red transition-colors"
                        aria-label="Clear search"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Empty State */}
            {currentList.length === 0 && (
                <div className="py-32 flex flex-col items-center justify-center border border-dashed border-gray-light bg-off-white">
                    <p className="font-display text-[20px] text-black mb-4">
                        {isSearching ? `No ${activeTab} designs match '${searchTerm}'` : `No ${activeTab} designs found`}
                    </p>
                    {isSearching && (
                        <button 
                            onClick={() => setDisplayTerm("")}
                            className="font-mono text-[12px] uppercase tracking-widest text-brand-red hover:underline"
                        >
                            Clear search
                        </button>
                    )}
                </div>
            )}

            {/* Select All */}
            {(isSearching || currentList.length > 12) && currentList.length > 0 && (
                <div className="flex justify-start -mb-4">
                    <button onClick={handleSelectAll} className="font-mono text-[11px] uppercase tracking-widest text-black hover:underline">
                        SELECT ALL {currentList.length} IN THIS VIEW
                    </button>
                </div>
            )}

            {/* Designs Grid */}
            {currentList.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {visibleList.map(renderDesignCard)}
                </div>
            )}

            {/* Collapsible Load More Button for Designs */}
            {hasMore && (
                <div className="flex justify-center mt-12 pt-8 border-t border-gray-light">
                    <button 
                        onClick={() => setVisibleCount(prev => prev + 12)}
                        className="group flex items-center gap-3 px-8 py-4 border border-black bg-transparent hover:bg-black text-black hover:text-white transition-all duration-300 font-mono text-[12px] font-bold uppercase tracking-widest"
                    >
                        See More ({currentList.length - visibleCount} Remaining) <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                    </button>
                </div>
            )}

            {/* Batch Action Bar */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-0 left-0 w-full h-[56px] bg-black z-[90] flex items-center justify-between px-4 md:px-8 animate-in slide-in-from-bottom-[56px] duration-200">
                    <span className="font-mono text-[11px] text-white uppercase tracking-widest">
                        {selectedIds.size} DESIGNS SELECTED
                    </span>
                    <div className="flex items-center gap-4">
                        {activeTab === 'active' && hasActiveSelections && (
                            <button onClick={handleBatchArchive} className="bg-transparent border border-neutral-600 px-4 py-2 font-mono text-[11px] text-white uppercase tracking-widest hover:bg-neutral-800 transition-colors">
                                BATCH ARCHIVE
                            </button>
                        )}
                        {activeTab === 'archived' && hasArchivedSelections && (
                            <button onClick={handleBatchSetPublic} className="bg-transparent border border-neutral-600 px-4 py-2 font-mono text-[11px] text-white uppercase tracking-widest hover:bg-neutral-800 transition-colors">
                                BATCH SET PUBLIC
                            </button>
                        )}
                        
                        <button onClick={() => setShowBatchDestroyModal(true)} className="bg-brand-red px-4 py-2 font-mono text-[11px] text-white uppercase tracking-widest hover:bg-red-600 transition-colors">
                            BATCH DESTROY
                        </button>
                        <button onClick={() => setSelectedIds(new Set())} className="text-neutral-400 hover:text-white transition-colors ml-4">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Batch Destroy Modal */}
            {showBatchDestroyModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBatchDestroyModal(false)} />
                    <div className="relative w-full max-w-[440px] bg-white border border-red-500 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center justify-between">
                            <span className="font-mono text-[13px] uppercase text-brand-red flex items-center gap-2">
                                <Trash2 className="w-4 h-4" /> BATCH DESTRUCTION
                            </span>
                            <button onClick={() => setShowBatchDestroyModal(false)} className="text-red-400 hover:text-red-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-6">
                                <p className="text-[14px] text-neutral-600 leading-relaxed font-sans mb-4">
                                    You are about to permanently delete <strong className="text-black">{selectedIds.size} designs</strong> and their storage files. This cannot be undone.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block font-mono text-[11px] uppercase text-neutral-400 mb-2">TYPE DESTROY TO CONFIRM</label>
                                    <input
                                        type="text"
                                        value={batchDestroyConfirm}
                                        onChange={(e) => setBatchDestroyConfirm(e.target.value)}
                                        className="w-full border border-neutral-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-transparent outline-none px-4 py-3 font-mono text-[16px] text-black transition-all rounded-none uppercase"
                                        autoFocus
                                    />
                                </div>
                                <button
                                    onClick={handleBatchDestroy}
                                    disabled={batchDestroyConfirm !== "DESTROY" || isActionLoading}
                                    className="w-full py-4 font-mono text-[12px] uppercase tracking-widest transition-all bg-brand-red text-white disabled:opacity-50 disabled:bg-neutral-200 disabled:text-neutral-500"
                                >
                                    {isActionLoading ? "Processing..." : `Destroy ${selectedIds.size} Designs`}
                                </button>
                                <button
                                    onClick={() => setShowBatchDestroyModal(false)}
                                    className="w-full py-3 bg-transparent border border-neutral-200 text-black font-mono text-[12px] uppercase tracking-widest hover:bg-neutral-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Global Toast */}
            {activeToast && (
                <div key={activeToast.id} className="fixed bottom-6 left-6 z-[100] bg-black shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
                    <div className="flex items-center justify-between p-4 px-6 min-w-[320px] max-w-[480px]">
                        <span className="font-mono text-[11px] text-white uppercase tracking-widest truncate mr-8">
                            {activeToast.message}
                        </span>
                        {activeToast.hasUndo && (
                            <button 
                                onClick={activeToast.undoAction}
                                className="font-mono text-[11px] text-[#E24B4A] font-bold uppercase tracking-widest hover:underline whitespace-nowrap"
                            >
                                UNDO
                            </button>
                        )}
                    </div>
                    {/* Animated Progress Bar */}
                    <div className="h-[2px] bg-neutral-800 w-full relative overflow-hidden">
                        <div 
                            className="absolute top-0 left-0 h-full bg-[#E24B4A] w-full" 
                            style={{ 
                                animation: 'toast-shrink 5s linear forwards',
                                transformOrigin: 'left'
                            }} 
                        />
                    </div>
                </div>
            )}
            
            <style jsx global>{`
                @keyframes toast-shrink {
                    from { transform: scaleX(1); }
                    to { transform: scaleX(0); }
                }
            `}</style>
        </div>
    );
}
