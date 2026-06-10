"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, X, Check, Trash2, Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Post } from "@/types/database.types";
import { AdminControls } from "@/components/admin/AdminControls";
import { supabase } from "@/lib/supabase";
import { togglePostPublishAction, batchTogglePublishAction, permanentDeleteAction, createPostAction } from "@/actions/admin";

interface PostManagerProps {
    posts: Post[];
}

export function PostManager({ posts }: PostManagerProps) {
    const router = useRouter();
    const [clientPosts, setClientPosts] = useState<Post[]>(posts);
    
    useEffect(() => {
        setClientPosts(posts);
    }, [posts]);

    const [displayTerm, setDisplayTerm] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showBatchDestroyModal, setShowBatchDestroyModal] = useState(false);
    const [batchDestroyConfirm, setBatchDestroyConfirm] = useState("");
    const [isActionLoading, setIsActionLoading] = useState(false);

    const [activeToast, setActiveToast] = useState<{
        id: string;
        message: string;
        hasUndo: boolean;
        undoAction?: () => void;
        timeoutId: NodeJS.Timeout;
    } | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setSearchTerm(displayTerm), 150);
        return () => clearTimeout(timer);
    }, [displayTerm]);

    useEffect(() => {
        const handleStatusToggle = (e: any) => {
            const { id, isPublished, subject } = e.detail;
            
            // This listener might receive events from BOTH DesignManager and PostManager
            // Use clientPosts to check if the ID belongs to a post
            if (!clientPosts.some(p => p.id === id)) return;

            setClientPosts(prev => prev.map(p => p.id === id ? { ...p, is_published: isPublished } : p));
            
            setActiveToast(prev => {
                if (prev) clearTimeout(prev.timeoutId);
                const timeoutId = setTimeout(() => setActiveToast(null), 5000);
                
                return {
                    id: `status-${id}`,
                    message: isPublished ? `POST IS NOW LIVE — ${subject}` : `POST ARCHIVED — ${subject}`,
                    hasUndo: !isPublished,
                    undoAction: async () => {
                        setClientPosts(pv => pv.map(p => p.id === id ? { ...p, is_published: true } : p));
                        await togglePostPublishAction(id, true);
                        clearTimeout(timeoutId);
                        setActiveToast(null);
                        window.dispatchEvent(new CustomEvent("content-updated"));
                    },
                    timeoutId
                };
            });
        };

        window.addEventListener("trigger-status-toast", handleStatusToggle);
        return () => window.removeEventListener("trigger-status-toast", handleStatusToggle);
    }, [clientPosts]);

    const allFiltered = useMemo(() => {
        let base = clientPosts.filter(p => !p.deleted_at);
        if (searchTerm.length >= 2) {
            const term = searchTerm.toLowerCase();
            return base.filter((p) => {
                const title = (p.title || "").toLowerCase();
                const slug = (p.slug || "").toLowerCase();
                const category = (p.category || "").toLowerCase();
                return title.includes(term) || slug.includes(term) || category.includes(term);
            });
        }
        return base;
    }, [searchTerm, clientPosts]);

    const activeList = allFiltered.filter(p => p.is_published);
    const archivedList = allFiltered.filter(p => !p.is_published);
    const currentList = activeTab === 'active' ? activeList : archivedList;

    const hasActiveSelections = Array.from(selectedIds).some(id => activeList.some(p => p.id === id));
    const hasArchivedSelections = Array.from(selectedIds).some(id => archivedList.some(p => p.id === id));

    const triggerRefresh = () => window.dispatchEvent(new CustomEvent("content-updated"));

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const handleSelectAll = () => {
        const newSet = new Set<string>();
        currentList.forEach(p => newSet.add(p.id));
        setSelectedIds(newSet);
    };

    const handleBatchArchive = async () => {
        const ids = Array.from(selectedIds).filter(id => activeList.some(p => p.id === id));
        if (ids.length === 0) return;
        
        setClientPosts(prev => prev.map(p => ids.includes(p.id) ? { ...p, is_published: false } : p));
        await batchTogglePublishAction('post', ids, false);
        
        setActiveToast(prev => {
            if (prev) clearTimeout(prev.timeoutId);
            const timeoutId = setTimeout(() => setActiveToast(null), 5000);
            return {
                id: `batch-${Date.now()}`,
                message: `${ids.length} POSTS ARCHIVED`,
                hasUndo: true,
                undoAction: async () => {
                    setClientPosts(pv => pv.map(p => ids.includes(p.id) ? { ...p, is_published: true } : p));
                    await batchTogglePublishAction('post', ids, true);
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
        const ids = Array.from(selectedIds).filter(id => archivedList.some(p => p.id === id));
        if (ids.length === 0) return;
        
        setClientPosts(prev => prev.map(p => ids.includes(p.id) ? { ...p, is_published: true } : p));
        await batchTogglePublishAction('post', ids, true);
        
        setActiveToast(prev => {
            if (prev) clearTimeout(prev.timeoutId);
            const timeoutId = setTimeout(() => setActiveToast(null), 5000);
            return {
                id: `batch-public-${Date.now()}`,
                message: `${ids.length} POSTS ARE NOW LIVE`,
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
        await permanentDeleteAction('post', idsArray);
        
        setShowBatchDestroyModal(false);
        setBatchDestroyConfirm("");
        setSelectedIds(new Set());
        setIsActionLoading(false);
        triggerRefresh();
    };

    const [visibleCount, setVisibleCount] = useState(3);

    const visibleList = useMemo(() => {
        // If searching, show all results immediately. Otherwise, restrict to visibleCount.
        if (searchTerm.length >= 2) return currentList;
        return currentList.slice(0, visibleCount);
    }, [currentList, visibleCount, searchTerm]);

    const hasMore = currentList.length > visibleList.length;

    const renderPostCard = (post: Post) => {
        const isArchived = !post.is_published;
        const isSelected = selectedIds.has(post.id);
        const anySelected = selectedIds.size > 0;

        return (
            <div key={post.id} className="group border border-neutral-200 p-6 hover:border-black transition-all relative animate-in fade-in duration-300 bg-white">
                <div className={`absolute top-6 left-6 z-[20] ${isSelected || anySelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                    <button 
                        onClick={() => toggleSelection(post.id)}
                        className={`w-4 h-4 flex items-center justify-center transition-colors ${isSelected ? 'bg-black border border-black' : 'bg-transparent border border-neutral-300 bg-white/50 backdrop-blur-sm hover:border-black'}`}
                    >
                        {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-[180px] h-[120px] relative overflow-hidden bg-off-white outline outline-1 outline-neutral-100 shrink-0">
                        {post.cover_image_url ? (
                            <img
                                src={post.cover_image_url}
                                alt={post.cover_image_alt || post.title}
                                className={`w-full h-full object-cover transition-opacity duration-300 ${isArchived ? 'opacity-40' : 'opacity-100'}`}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center font-mono text-[10px] text-neutral-300 uppercase">No Image</div>
                        )}
                        
                        {isArchived && (
                            <div className="absolute inset-0 pointer-events-none opacity-50" 
                                 style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, #e5e5e5 8px, #e5e5e5 10px)' }} 
                            />
                        )}
                    </div>

                    <div className="flex flex-col justify-between flex-grow min-w-0">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 border border-neutral-200 text-neutral-500 whitespace-nowrap">
                                    {post.category}
                                </span>
                                {isArchived && (
                                    <span className="bg-neutral-100 text-neutral-500 border border-neutral-300 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest">ARCHIVED</span>
                                )}
                            </div>
                            <h3 className="font-display text-[20px] text-black truncate mt-2">{post.title}</h3>
                            <p className="font-mono text-[10px] text-gray-mid uppercase tracking-widest truncate">{post.slug}</p>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-light flex items-center justify-between">
                            <span className="font-mono text-[10px] text-neutral-400 uppercase">{new Date(post.published_at).toLocaleDateString()}</span>
                            <AdminControls
                                type="post"
                                id={post.id}
                                isPublished={post.is_published}
                                isDeleted={!!post.deleted_at}
                                title={post.title}
                                slug={post.slug}
                                imageUrl={post.cover_image_url}
                                excerpt={post.excerpt}
                                bodyContent={post.body_content}
                                category={post.category}
                                tags={Array.isArray(post.tags) ? post.tags.join(", ") : post.tags}
                                readTimeMinutes={post.read_time_minutes}
                                focusKeyword={post.focus_keyword || ""}
                                metaTitle={post.meta_title || ""}
                                schemaType={post.schema_type || "Article"}
                                relatedDesigns={post.related_designs}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex gap-8 border-b border-neutral-200">
                <button 
                    onClick={() => {
                        setActiveTab('active');
                        setVisibleCount(3);
                    }}
                    className={`pb-4 font-mono text-[13px] uppercase tracking-widest transition-all relative ${
                        activeTab === 'active' ? 'text-black font-bold' : 'text-neutral-400 hover:text-black'
                    }`}
                >
                    Active Posts ({activeList.length})
                    {activeTab === 'active' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />}
                </button>
                <button 
                    onClick={() => {
                        setActiveTab('archived');
                        setVisibleCount(3);
                    }}
                    className={`pb-4 font-mono text-[13px] uppercase tracking-widest transition-all relative ${
                        activeTab === 'archived' ? 'text-black font-bold' : 'text-neutral-400 hover:text-black'
                    }`}
                >
                    Archived Posts ({archivedList.length})
                    {activeTab === 'archived' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />}
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-mid group-focus-within:text-black transition-colors">
                        <Search className="w-5 h-5" />
                    </div>
                    <input 
                        type="text" 
                        value={displayTerm}
                        onChange={(e) => setDisplayTerm(e.target.value)}
                        placeholder="Search posts by title, category, or slug..."
                        className="w-full bg-off-white border-b-2 border-gray-light focus:border-black outline-none py-6 pl-12 pr-12 font-mono text-[16px] transition-all placeholder:text-gray-mid"
                    />
                </div>
                
                <button 
                    onClick={() => router.push("/admin/publish")}
                    className="flex items-center justify-center gap-3 bg-black text-white px-8 py-6 font-mono text-[14px] font-bold uppercase tracking-widest hover:bg-brand-red transition-all shrink-0"
                >
                    <Plus className="w-5 h-5" />
                    Create New Post
                </button>
            </div>

            {currentList.length === 0 && (
                <div className="py-24 flex flex-col items-center justify-center border border-dashed border-gray-light bg-off-white">
                    <p className="font-display text-[20px] text-black">No posts found</p>
                </div>
            )}

            <div className="flex flex-col gap-4">
                {visibleList.map(renderPostCard)}
            </div>

            {hasMore && (
                <div className="flex justify-center mt-6 pt-6 border-t border-gray-light">
                    <button 
                        onClick={() => setVisibleCount(prev => prev + 6)}
                        className="group flex items-center gap-3 px-8 py-4 border border-black bg-transparent hover:bg-black text-black hover:text-white transition-all duration-300 font-mono text-[12px] font-bold uppercase tracking-widest"
                    >
                        See More ({currentList.length - visibleCount} Remaining) <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                    </button>
                </div>
            )}

            {selectedIds.size > 0 && (
                <div className="fixed bottom-0 left-0 w-full h-[56px] bg-black z-[90] flex items-center justify-between px-4 md:px-8 animate-in slide-in-from-bottom-[56px] duration-200">
                    <span className="font-mono text-[11px] text-white uppercase tracking-widest">
                        {selectedIds.size} POSTS SELECTED
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
                            <p className="text-[14px] text-neutral-600 mb-6">You are about to permanently delete <strong className="text-black">{selectedIds.size} posts</strong>. This cannot be undone.</p>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={batchDestroyConfirm}
                                    onChange={(e) => setBatchDestroyConfirm(e.target.value)}
                                    placeholder="TYPE DESTROY TO CONFIRM"
                                    className="w-full border border-neutral-200 focus:border-red-500 bg-transparent outline-none px-4 py-3 font-mono text-[16px] uppercase"
                                />
                                <button
                                    onClick={handleBatchDestroy}
                                    disabled={batchDestroyConfirm !== "DESTROY" || isActionLoading}
                                    className="w-full py-4 bg-brand-red text-white font-mono text-[12px] uppercase tracking-widest disabled:opacity-50"
                                >
                                    Destroy {selectedIds.size} Posts
                                </button>
                                <button onClick={() => setShowBatchDestroyModal(false)} className="w-full py-3 border border-neutral-200 text-black font-mono text-[12px] uppercase">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeToast && (
                <div key={activeToast.id} className="fixed bottom-6 left-6 z-[100] bg-black shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
                    <div className="flex items-center justify-between p-4 px-6 min-w-[320px] max-w-[480px]">
                        <span className="font-mono text-[11px] text-white uppercase tracking-widest truncate mr-8">{activeToast.message}</span>
                        {activeToast.hasUndo && (
                            <button onClick={activeToast.undoAction} className="font-mono text-[11px] text-[#E24B4A] font-bold uppercase tracking-widest hover:underline whitespace-nowrap">UNDO</button>
                        )}
                    </div>
                    <div className="h-[2px] bg-neutral-800 w-full relative overflow-hidden">
                        <div className="absolute top-0 left-0 h-full bg-[#E24B4A] w-full" style={{ animation: 'toast-shrink 5s linear forwards', transformOrigin: 'left' }} />
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
