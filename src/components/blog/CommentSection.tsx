"use client";

import React, { useState, useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { submitCommentAction } from "@/actions/comments";
import { MessageSquare, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Lock, User2, Camera, Image as ImageIcon, X } from "lucide-react";
import { useModal } from "@/context/ModalContext";
import { supabase } from "@/lib/supabase";

export interface CommentItem {
    id: string;
    author_name: string;
    content: string;
    created_at: string;
    is_admin_reply?: boolean;
    image_url?: string | null;
}

interface CommentSectionProps {
    postId: string;
    comments: CommentItem[];
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="bg-black text-white font-mono text-[11px] uppercase tracking-widest px-8 py-4 hover:bg-brand-red transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto justify-center"
        >
            {pending ? (
                <>
                    <Loader2 className="w-3 h-3 animate-spin" /> PROCESSING...
                </>
            ) : (
                "POST COMMENT"
            )}
        </button>
    );
}

export default function CommentSection({ postId, comments = [] }: CommentSectionProps) {
    const [state, formAction] = useActionState(submitCommentAction, { success: false, message: "" });
    const [hasSubmittedLocal, setHasSubmittedLocal] = useState(false);
    
    // File Attachment States
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Pagination / Expansion state
    const [isExpanded, setIsExpanded] = useState(false);
    const DISPLAY_LIMIT = 4;
    const hasMore = comments.length > DISPLAY_LIMIT;
    const visibleComments = isExpanded ? comments : comments.slice(0, DISPLAY_LIMIT);

    // Auth Integration
    const { openLoginModal } = useModal();
    const [user, setUser] = useState<any>(null);
    const [isCheckingUser, setIsCheckingUser] = useState(true);

    // 1. Fetch user on component mount
    useEffect(() => {
        async function loadUser() {
            try {
                const { data } = await supabase.auth.getUser();
                if (data?.user) {
                    setUser(data.user);
                }
            } catch (e) {
                // Silent ignore auth failure
            } finally {
                setIsCheckingUser(false);
            }
        }
        loadUser();
    }, []);

    // 2. Handle form success state & Clear local artifacts
    useEffect(() => {
        if (state.success) {
            setHasSubmittedLocal(true);
            // Clear local file states
            setSelectedFile(null);
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    }, [state.success]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate sizing and types immediately in frontend
        if (file.size > 5 * 1024 * 1024) {
            alert("Image size limit is 5MB.");
            return;
        }
        
        setSelectedFile(file);
        // Create localized URL object for instantly rendered DOM preview
        const objUrl = URL.createObjectURL(file);
        setPreviewUrl(objUrl);
    };

    const removeFile = () => {
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Get display name safely derived from metadata
    const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || "Anonymous User";

    return (
        <div id="discussion" className="w-full max-w-[680px] mx-auto pt-24 pb-12 px-5 border-t border-neutral-100 mt-24">
            
            {/* HEADER */}
            <div className="flex items-center justify-between mb-12 border-b border-neutral-100 pb-6">
                <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-black" />
                    <h2 className="font-display text-[24px] uppercase tracking-tight text-black">
                        Discussion ({comments.length})
                    </h2>
                </div>
                <div className="font-mono text-[10px] uppercase text-neutral-400 tracking-widest flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Accounts
                </div>
            </div>

            {/* COMMENT LIST */}
            <div className="space-y-8 mb-8">
                {comments.length === 0 ? (
                    <div className="py-12 text-center border border-dashed border-neutral-200 bg-neutral-50">
                        <p className="font-mono text-[12px] text-neutral-400 uppercase tracking-widest">No public comments yet.</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-8">
                            {visibleComments.map((comment) => (
                                <div key={comment.id} className={`group flex gap-4 animate-in fade-in duration-300 ${comment.is_admin_reply ? 'bg-neutral-50 p-5 border-l-2 border-brand-red' : ''}`}>
                                    <div className="flex-shrink-0 w-10 h-10 bg-neutral-100 rounded-none flex items-center justify-center">
                                        {comment.is_admin_reply ? (
                                            <ShieldCheck className="w-5 h-5 text-brand-red" />
                                        ) : (
                                            <div className="w-10 h-10 bg-neutral-100 flex items-center justify-center text-neutral-400 font-bold font-mono text-[12px]">
                                                {comment.author_name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`font-sans text-[14px] font-bold flex items-center gap-1.5 ${comment.is_admin_reply ? 'text-brand-red' : 'text-black'}`}>
                                                {comment.author_name}
                                                {comment.is_admin_reply && <span className="ml-1 font-mono text-[9px] uppercase bg-brand-red text-white px-1.5 py-0.5">ADMIN</span>}
                                            </span>
                                            <span className="text-neutral-300">•</span>
                                            <span className="font-mono text-[10px] text-neutral-400">
                                                {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className="font-sans text-[15px] text-neutral-700 leading-relaxed whitespace-pre-wrap mb-4">
                                            {comment.content}
                                        </p>
                                        
                                        {/* ATTACHED IMAGE RENDER */}
                                        {comment.image_url && (
                                            <div className="mt-3 max-w-[320px] border border-neutral-100 bg-neutral-50">
                                                <img 
                                                    src={comment.image_url} 
                                                    alt={`Upload by ${comment.author_name}`} 
                                                    loading="lazy"
                                                    className="w-full h-auto block object-contain"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {hasMore && !isExpanded && (
                            <div className="pt-6 text-center">
                                <button 
                                    onClick={() => setIsExpanded(true)}
                                    className="font-mono text-[11px] uppercase tracking-[0.15em] text-black border border-black px-8 py-3 hover:bg-black hover:text-white transition-all duration-300"
                                >
                                    See {comments.length - DISPLAY_LIMIT} More Comments
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* INPUT FORM OR LOGIN GATE */}
            <div className="relative">
                {isCheckingUser ? (
                    <div className="p-12 bg-neutral-50 animate-pulse flex justify-center items-center border border-neutral-100">
                         <Loader2 className="w-6 h-6 text-neutral-300 animate-spin" />
                    </div>
                ) : !user ? (
                    <div className="bg-neutral-50 border border-dashed border-neutral-300 p-12 flex flex-col items-center text-center group hover:border-black transition-colors duration-500">
                        <div className="w-16 h-16 bg-white shadow-sm border border-neutral-100 rounded-full flex items-center justify-center mb-6 relative">
                             <Lock className="w-6 h-6 text-black group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
                        </div>
                        <h3 className="font-display text-[26px] uppercase tracking-tight text-black mb-3">Write a Comment</h3>
                        <p className="font-sans text-[15px] text-neutral-500 mb-8 max-w-[360px] leading-relaxed">
                            Found this guide helpful? Log in with Google to post a direct question or share your experience with the community instantly.
                        </p>
                        
                        <button 
                            onClick={openLoginModal}
                            className="bg-black text-white font-mono text-[12px] uppercase tracking-[0.15em] px-10 py-[18px] flex items-center gap-3 shadow-xl hover:bg-brand-red hover:-translate-y-0.5 transition-all active:translate-y-0 duration-300"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Sign In with Google
                        </button>
                    </div>
                ) : (
                    // LOGGED IN VIEW
                    <div className="bg-white border border-black p-8 md:p-10 relative overflow-hidden shadow-lg">
                        {hasSubmittedLocal ? (
                            <div className="py-8 text-center flex flex-col items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h3 className="font-display text-[24px] uppercase tracking-tight text-black">Comment Received</h3>
                                <p className="font-sans text-[15px] text-neutral-600 max-w-[320px]">
                                    {state.message}
                                </p>
                                <button 
                                    onClick={() => setHasSubmittedLocal(false)} 
                                    className="mt-6 font-mono text-[11px] uppercase tracking-widest text-neutral-400 hover:text-black border-b border-neutral-200 hover:border-black transition-colors"
                                >
                                    Write another reply
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-8 pb-6 border-b border-neutral-100">
                                    <div className="flex items-center gap-3">
                                        {user.user_metadata?.avatar_url ? (
                                            <img 
                                                src={user.user_metadata.avatar_url} 
                                                alt="Profile" 
                                                className="w-10 h-10 rounded-full border border-neutral-200"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-neutral-100 flex items-center justify-center text-black border border-neutral-200">
                                                <User2 className="w-5 h-5" strokeWidth={1.5} />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 leading-none mb-1">Logged in as</p>
                                            <p className="font-sans font-bold text-[15px] text-black leading-none">{userName}</p>
                                        </div>
                                    </div>
                                    <div className="font-mono text-[9px] uppercase tracking-widest text-green-600 flex items-center gap-1.5 bg-green-50 px-2 py-1 font-bold">
                                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span> Verified
                                    </div>
                                </div>

                                {state.message && !state.success && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 flex items-center gap-3 text-[13px]">
                                        <AlertCircle className="w-4 h-4" />
                                        {state.message}
                                    </div>
                                )}

                                <form action={formAction} className="space-y-6">
                                    <input type="hidden" name="post_id" value={postId} />
                                    <input type="hidden" name="author_name" value={userName} />
                                    <input type="hidden" name="author_email" value={user.email || ""} />
                                    
                                    <div className="relative group">
                                        <textarea 
                                            name="content" 
                                            required 
                                            rows={4}
                                            placeholder={`What do you think about this guide, ${userName.split(' ')[0]}?`}
                                            className="w-full border-0 border-b border-neutral-200 focus:border-black p-0 pb-4 text-[17px] md:text-[19px] focus:outline-none focus:ring-0 transition-colors font-serif italic resize-none placeholder:text-neutral-300"
                                        />
                                    </div>

                                    {/* PREVIEW AREA FOR SELECTED FILE */}
                                    {previewUrl && (
                                        <div className="relative w-24 h-24 group border border-neutral-200 mt-4 animate-in zoom-in-95 duration-200">
                                            <img 
                                                src={previewUrl} 
                                                alt="Attachment Preview" 
                                                className="w-full h-full object-cover"
                                            />
                                            <button 
                                                type="button"
                                                onClick={removeFile}
                                                className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 shadow-md hover:bg-brand-red transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}

                                    {/* TOOLBAR WITH ACTION BUTTONS */}
                                    <div className="pt-2 flex justify-between items-center">
                                        
                                        {/* Invisible file picker hidden behind beautiful button icon */}
                                        <div className="flex items-center gap-4">
                                            <label className={`flex items-center gap-2 cursor-pointer font-mono text-[11px] uppercase tracking-widest transition-colors ${selectedFile ? 'text-brand-red' : 'text-neutral-500 hover:text-black'}`}>
                                                <input 
                                                    ref={fileInputRef}
                                                    type="file" 
                                                    name="comment_image" 
                                                    accept="image/*" 
                                                    onChange={handleFileChange} 
                                                    className="hidden" 
                                                />
                                                <Camera className="w-4 h-4" /> 
                                                {selectedFile ? "Change Photo" : "Attach Photo"}
                                            </label>
                                        </div>

                                        <SubmitButton />
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                )}
            </div>

        </div>
    );
}
