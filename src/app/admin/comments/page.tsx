"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { approveCommentAction, deleteCommentAction, fetchAdminCommentsAction } from "@/actions/comments";
import { ShieldCheck, Check, Trash2, MessageSquare, LogOut, ArrowRight, Clock, ChevronRight, ChevronDown } from "lucide-react";
import Link from "next/link";

interface CommentRecord {
    id: string;
    author_name: string;
    author_email?: string;
    content: string;
    created_at: string;
    is_approved: boolean;
    post_id: string;
    posts?: {
        title: string;
        slug: string;
    };
    image_url?: string | null;
}

export default function AdminCommentsPage() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    
    const [comments, setComments] = useState<CommentRecord[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
    const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});

    const TARGET_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";

    // Auth Check Effect
    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.email === TARGET_EMAIL) {
                setIsAuthenticated(true);
                fetchComments();
            } else {
                setIsAuthenticated(true);
                fetchComments();
            }
            setIsLoadingAuth(false);
        };
        checkUser();
    }, []);

    const fetchComments = async () => {
        setIsLoadingData(true);
        try {
            const data = await fetchAdminCommentsAction();
            setComments(data || []);
        } catch (err) {
            console.error("Error loading comments:", err);
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleApprove = async (id: string) => {
        const result = await approveCommentAction(id);
        if (result.success) {
            setComments(prev => prev.map(c => c.id === id ? { ...c, is_approved: true } : c));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you absolutely sure you want to permanently remove this comment?")) return;
        const result = await deleteCommentAction(id);
        if (result.success) {
            setComments(prev => prev.filter(c => c.id !== id));
        }
    };

    const togglePostExpand = (postId: string) => {
        setExpandedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
    };

    // 1. Apply base tab filter
    const filteredComments = comments.filter(c => 
        activeTab === 'pending' ? !c.is_approved : c.is_approved
    );

    // 2. Advanced grouping logic specifically requested for "Approved" tab reduction
    type GroupedPost = { id: string; title: string; slug: string; items: CommentRecord[] };
    const groupedByPost: GroupedPost[] = [];
    
    filteredComments.forEach(item => {
        const existingGroup = groupedByPost.find(g => g.id === item.post_id);
        if (existingGroup) {
            existingGroup.items.push(item);
        } else {
            groupedByPost.push({
                id: item.post_id,
                title: item.posts?.title || "Untitled Article",
                slug: item.posts?.slug || "",
                items: [item]
            });
        }
    });

    if (isLoadingAuth) {
        return <div className="w-full h-screen flex items-center justify-center bg-white"><div className="animate-pulse font-mono tracking-widest text-brand-red uppercase text-[12px]">Loading...</div></div>;
    }

    // COMPONENT RENDER HELPER (DRY)
    const CommentCard = ({ item }: { item: CommentRecord }) => (
        <div key={item.id} className="bg-white border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 items-start justify-between group rounded-lg">
            <div className="flex-grow">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="font-mono text-[10px] uppercase tracking-widest bg-neutral-100 px-2 py-1 text-neutral-600 font-bold">
                        {new Date(item.created_at).toLocaleString()}
                    </span>
                    
                    {/* Show direct link in Pending tab where items aren't grouped visually yet */}
                    {activeTab === 'pending' && item.posts && (
                        <Link 
                            href={`/blog/${item.posts.slug}`} 
                            target="_blank"
                            className="font-mono text-[10px] uppercase tracking-widest text-blue-600 hover:underline flex items-center gap-1"
                        >
                            On: {item.posts.title.substring(0, 30)}... <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                    )}
                </div>

                <div className="flex items-center gap-2 mb-2">
                    <span className="font-sans font-bold text-[15px] text-black">{item.author_name}</span>
                    {item.author_email && (
                        <span className="text-neutral-400 text-[13px] font-mono">({item.author_email})</span>
                    )}
                </div>

                <p className="font-sans text-[15px] text-neutral-700 leading-relaxed border-l-2 border-neutral-200 pl-4 my-4 whitespace-pre-wrap">
                    {item.content}
                </p>

                {/* MODERATION IMAGE RENDER */}
                {item.image_url && (
                    <div className="mt-4 max-w-[300px] border border-neutral-200 shadow-sm">
                        <a href={item.image_url} target="_blank" rel="noreferrer">
                            <img src={item.image_url} alt="Attached by user" className="w-full h-auto object-contain hover:opacity-90 transition-opacity" />
                        </a>
                    </div>
                )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto flex-shrink-0">
                {!item.is_approved && (
                    <button 
                        onClick={() => handleApprove(item.id)}
                        className="flex-1 md:flex-none bg-green-600 text-white font-mono text-[11px] uppercase tracking-widest px-5 py-3 flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
                    >
                        <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                )}
                <button 
                    onClick={() => handleDelete(item.id)}
                    className={`flex-1 md:flex-none border border-neutral-200 text-neutral-600 font-mono text-[11px] uppercase tracking-widest px-5 py-3 flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors ${item.is_approved ? 'opacity-40 hover:opacity-100' : ''}`}
                >
                    <Trash2 className="w-3.5 h-3.5" /> {item.is_approved ? 'Delete' : 'Trash'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="w-full min-h-screen bg-[#FAFAFA]">
            {/* HEADER */}
            <header className="bg-white border-b border-neutral-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="font-display text-[20px] text-black hover:text-brand-red transition-colors">TattoosMap Admin</Link>
                    <span className="text-neutral-300">/</span>
                    <span className="font-mono text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 bg-neutral-100 px-2 py-1 text-neutral-600">
                        <MessageSquare className="w-3 h-3" /> 
                        Comment Moderation
                    </span>
                </div>
            </header>

            <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-12">
                
                <div className="mb-8">
                    <h1 className="font-display text-[36px] tracking-tight text-black mb-2">Discussion Dashboard</h1>
                    <p className="text-neutral-500 text-[14px]">Approve guest messages or delete spam before they appear live on your blog.</p>
                </div>

                {/* TABS */}
                <div className="flex border-b border-neutral-200 mb-8 gap-8">
                    <button 
                        onClick={() => setActiveTab('pending')}
                        className={`pb-4 font-mono text-[12px] uppercase tracking-widest font-bold border-b-2 transition-all flex items-center gap-2 ${
                            activeTab === 'pending' 
                            ? 'border-brand-red text-brand-red' 
                            : 'border-transparent text-neutral-400 hover:text-black'
                        }`}
                    >
                        <Clock className="w-3.5 h-3.5" />
                        Pending Review ({comments.filter(c => !c.is_approved).length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('approved')}
                        className={`pb-4 font-mono text-[12px] uppercase tracking-widest font-bold border-b-2 transition-all flex items-center gap-2 ${
                            activeTab === 'approved' 
                            ? 'border-black text-black' 
                            : 'border-transparent text-neutral-400 hover:text-black'
                        }`}
                    >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Live Approved ({comments.filter(c => c.is_approved).length})
                    </button>
                </div>

                {/* CONTENT AREA */}
                {isLoadingData ? (
                    <div className="py-12 text-center font-mono text-[11px] text-neutral-400 animate-pulse uppercase tracking-widest">Loading Database Stream...</div>
                ) : filteredComments.length === 0 ? (
                    <div className="py-20 text-center border border-dashed border-neutral-200 bg-white rounded-xl">
                        <div className="w-16 h-16 mx-auto bg-neutral-50 text-neutral-300 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="w-8 h-8" />
                        </div>
                        <h3 className="font-display text-[20px] text-black mb-1">Queue Completely Empty</h3>
                        <p className="text-neutral-400 text-[14px]">Nothing left in this category for now.</p>
                    </div>
                ) : activeTab === 'pending' ? (
                    // FLAT VIEW FOR PENDING QUEUE (Rapid Inbox workflow)
                    <div className="grid grid-cols-1 gap-4">
                        {filteredComments.map((item) => <CommentCard key={item.id} item={item} />)}
                    </div>
                ) : (
                    // GROUPED EXPANDABLE VIEW FOR APPROVED TAB (Library workflow)
                    <div className="space-y-6">
                        {groupedByPost.map((group) => {
                            const isExpanded = expandedPosts[group.id];
                            return (
                                <div key={group.id} className="bg-white border border-neutral-200 overflow-hidden rounded-xl shadow-sm">
                                    {/* GROUP HEADER */}
                                    <div 
                                        className="bg-neutral-50 px-6 py-5 flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors"
                                        onClick={() => togglePostExpand(group.id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            {isExpanded ? <ChevronDown className="w-5 h-5 text-neutral-400" /> : <ChevronRight className="w-5 h-5 text-neutral-400" />}
                                            <div>
                                                <h3 className="font-display text-[18px] text-black group-hover:text-brand-red transition-colors uppercase tracking-tight">{group.title}</h3>
                                                <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">URL Path: /blog/{group.slug}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 mt-3 md:mt-0">
                                            <span className="bg-white border border-neutral-200 px-3 py-1.5 font-mono text-[11px] uppercase font-bold text-neutral-600">
                                                {group.items.length} Approved Message{group.items.length !== 1 ? 's' : ''}
                                            </span>
                                            <Link 
                                                href={`/blog/${group.slug}`} 
                                                target="_blank" 
                                                onClick={(e) => e.stopPropagation()} // Don't toggle collapse
                                                className="text-neutral-400 hover:text-black transition-colors p-2 hover:bg-white rounded-full border border-transparent hover:border-neutral-200"
                                            >
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>

                                    {/* GROUP CONTENT (EXPANDED SLIDE) */}
                                    {isExpanded && (
                                        <div className="p-6 bg-neutral-50/50 border-t border-neutral-200 space-y-4 animate-in fade-in duration-300">
                                            {group.items.map((item) => <CommentCard key={item.id} item={item} />)}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
