import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { ADMIN_EMAILS } from "@/lib/admin";
import { AdminControls } from "@/components/admin/AdminControls";
import { Post, Design } from "@/types/database.types";
import Image from "next/image";
import Link from "next/link";
import { MessageSquare, ArrowRight } from "lucide-react";
import { RefreshTrigger } from "@/app/admin/manage/RefreshTrigger";
import { DesignManager } from "@/components/admin/DesignManager";
import { PostManager } from "@/components/admin/PostManager";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Always fresh for admin management

export default async function ManagePage() {
    const supabase = await createClient();

    // 1. Strict Server-Side Auth Check
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
        redirect("/");
    }
    // 2. Fetch All Data using admin client to bypass RLS (ensures we see archived items)
    const { data: posts } = await supabaseAdmin
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

    const { data: designs } = await supabaseAdmin
        .from("designs")
        .select("*")
        .order("uploaded_at", { ascending: false });

    // 3. Fetch pending comments count for notification badge (wrapped defensively)
    let pendingCommentsCount = 0;
    try {
        const { count } = await supabaseAdmin
            .from("blog_comments")
            .select("*", { count: "exact", head: true })
            .eq("is_approved", false);
        
        pendingCommentsCount = count || 0;
    } catch (e) { /* Table might not exist yet */ }

    return (
        <div className="w-full bg-white min-h-screen pb-32">

            {/* Header */}
            <div className="max-w-[1280px] mx-auto px-4 md:px-8 pt-32 pb-16 border-b border-gray-light flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                <div>
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-red mb-4 block">System · Controller</span>
                    <h1 className="font-display text-[48px] md:text-[64px] leading-none text-black tracking-tight mb-4">
                        Manager.
                    </h1>
                    <p className="text-[16px] text-gray-mid max-w-[500px]">
                        Unified dashboard for editorial posts and uploaded designs. Archive, activate, or permanently remove content.
                    </p>
                </div>

                {/* Moderation Notification Button */}
                <div className="flex-shrink-0">
                    <Link 
                        href="/admin/comments" 
                        className={`group flex items-center gap-4 px-6 py-4 border transition-all duration-300 rounded-none ${
                            pendingCommentsCount > 0 
                            ? "bg-brand-red border-brand-red text-white hover:brightness-110 shadow-lg" 
                            : "bg-white border-black text-black hover:bg-black hover:text-white"
                        }`}
                    >
                        <div className="flex flex-col items-start">
                            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest font-bold mb-1 opacity-80">
                                <MessageSquare className="w-3.5 h-3.5" /> 
                                Community
                            </div>
                            <span className="font-display text-[20px] leading-none">
                                {pendingCommentsCount > 0 
                                    ? `(${pendingCommentsCount}) Comment on Hold` 
                                    : "View Moderation"
                                }
                            </span>
                        </div>
                        <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* Dashboard Sections */}
            <div className="max-w-[1280px] mx-auto px-4 md:px-8 pt-16 flex flex-col gap-24">

                {/* ── Blog Posts Section ── */}
                <section>
                    <h2 className="font-mono text-[12px] uppercase tracking-[0.15em] text-gray-mid mb-8 flex items-center gap-4">
                        Blog Posts <span className="w-full h-[1px] bg-gray-light" />
                    </h2>

                    <PostManager posts={posts || []} />
                </section>

                {/* ── Designs Section ── */}
                <section className="pb-32">
                    <h2 className="font-mono text-[12px] uppercase tracking-[0.15em] text-gray-mid mb-8 flex items-center gap-4">
                        Uploaded Designs <span className="w-full h-[1px] bg-gray-light" />
                    </h2>

                    <DesignManager designs={designs || []} />
                </section>

            </div>

            {/* Client-side "Refresh Helper" - Since onUpdate needs to refresh server data */}
            <RefreshTrigger />

        </div>
    );
}


/**
 * Empty client component that just provides a way to refresh the page 
 * when the server component triggers an update.
 */
