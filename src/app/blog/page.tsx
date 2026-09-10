import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { Post } from "@/types/database.types";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Tattoo Meanings, Care Guides & Inspiration Blog | TattoosMap",
    description: "Honest guides on tattoo removal, aftercare science, and product rankings. Clinical accuracy. No sponsored opinions. Updated 2026.",
    alternates: {
        canonical: "https://tattoosmap.com/blog",
    },
    openGraph: {
        title: "Tattoo Meanings, Care Guides & Inspiration Blog | TattoosMap",
        description: "Honest guides on tattoo removal, aftercare science, and product rankings. Clinical accuracy. No sponsored opinions. Updated 2026.",
        url: "https://tattoosmap.com/blog",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Tattoo Meanings, Care Guides & Inspiration Blog | TattoosMap",
        description: "Honest guides on tattoo removal, aftercare science, and product rankings. Clinical accuracy. No sponsored opinions. Updated 2026.",
    }
};

export const revalidate = 60; // Cache blog index page for 1 minute

export default async function BlogIndex({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    let posts: Post[] = [];
    let commentCountMap: Record<string, number> = {};
    const supabase = await createClient();
    const resolvedSearchParams = await searchParams;
    const currentPage = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page, 10) : 1;
    
    // EXACT STAGGERED PAGINATION CALCULATION
    const POSTS_PAGE_ONE = 6;
    const POSTS_PAGE_OTHER = 9;

    let totalPages = 1;
    let totalCount = 0;
    
    try {
        // 1. Get the total count of posts
        const { count, error: countError } = await supabase
            .from("posts")
            .select("*", { count: 'exact', head: true })
            .eq("is_published", true)
            .is("deleted_at", null);
            
        totalCount = count || 0;
        
        if (totalCount > (1 + POSTS_PAGE_ONE)) {
            const remainingForSubsequentPages = totalCount - (1 + POSTS_PAGE_ONE);
            totalPages = 1 + Math.ceil(remainingForSubsequentPages / POSTS_PAGE_OTHER);
        }

        // 2. Calculate offset and limit for the current page
        let limit = 0;
        let offset = 0;
        if (currentPage === 1) {
            limit = 1 + POSTS_PAGE_ONE; // 7 posts
            offset = 0;
        } else {
            limit = POSTS_PAGE_OTHER; // 9 posts
            offset = 1 + POSTS_PAGE_ONE + (currentPage - 2) * POSTS_PAGE_OTHER;
        }

        // 3. Fetch only the required posts
        const { data: postsData, error: postsError } = await supabase
            .from("posts")
            .select("*")
            .eq("is_published", true)
            .is("deleted_at", null)
            .order("published_at", { ascending: false })
            .range(offset, offset + limit - 1);
            
        let livePosts: Post[] = [];
        if (!postsError && postsData && postsData.length > 0) {
            const authorIds = Array.from(new Set(postsData.map(p => p.author_id).filter(Boolean)));
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            const validAuthorIds = authorIds.filter(id => uuidRegex.test(id));
            
            let profilesMap: Record<string, any> = {};
            if (validAuthorIds.length > 0) {
                const { data: profilesData } = await supabase
                    .from("profiles")
                    .select("id, username, avatar_url")
                    .in("id", validAuthorIds);
                    
                if (profilesData) {
                    profilesData.forEach(p => {
                        profilesMap[p.id] = p;
                    });
                }
            }

            livePosts = postsData.map((p: any) => {
                const profile = profilesMap[p.author_id] || {};
                return {
                    ...p,
                    author: {
                        id: profile.id || p.author_id || "a1",
                        name: profile.username || profile.name || "TattoosMap Editorial",
                        avatar_url: profile.avatar_url || "/brand-logo.png",
                        bio: "The official editorial voice of TattoosMap."
                    }
                };
            });
            
            const postIds = livePosts.map(p => p.id);
            const { data: commentCounts } = await supabase
                .from('blog_comments')
                .select('post_id')
                .in('post_id', postIds)
                .eq('is_approved', true);
            
            if (commentCounts) {
                commentCounts.forEach((c: any) => {
                    commentCountMap[c.post_id] = (commentCountMap[c.post_id] || 0) + 1;
                });
            }
        } else if (postsError) {
            console.error("[BLOG] Supabase posts fetch error:", postsError);
        }

        posts = livePosts;

    } catch (err) {
        console.error("[BLOG] Fatal dynamic fetch error:", err);
        posts = [];
    }

    let gridPosts: Post[] = [];
    let featuredPost: Post | null = null;

    if (currentPage === 1 && posts.length > 0) {
        featuredPost = posts[0];
        gridPosts = posts.slice(1);
    } else {
        gridPosts = posts;
    }

    const getPageNumbers = (current: number, total: number) => {
        if (total <= 6) return Array.from({ length: total }, (_, i) => i + 1);
        if (current <= 3) return [1, 2, 3, 4, '...', total];
        if (current >= total - 2) return [1, '...', total - 3, total - 2, total - 1, total];
        return [1, '...', current - 1, current, current + 1, '...', total];
    };
    const pageNumbers = getPageNumbers(currentPage, totalPages);

    return (
        <div className="w-full bg-white pb-32">

            {/* 1. Featured Hero Article (Top) - ONLY VISIBLE ON PAGE 1 */}
            {currentPage === 1 && featuredPost && (
                <section className="max-w-[1280px] mx-auto px-4 md:px-6 pt-12 pb-24 border-b border-gray-light">
                    <Link href={`/blog/${featuredPost.slug}`} className="group block">
                        <div className="flex flex-col-reverse md:flex-row gap-8 lg:gap-16 items-center">

                            {/* Content Left */}
                            <div className="w-full md:w-[45%] flex flex-col justify-center">
                                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-brand-red mb-4">
                                    {featuredPost.category}
                                </span>
                                <h2 className="font-display text-[32px] md:text-[56px] lg:text-[64px] leading-[1] text-black m-0 group-hover:text-brand-red transition-colors tracking-tight mb-6">
                                    {featuredPost.title}
                                </h2>
                                <p className="text-[15px] md:text-[16px] text-gray-mid leading-[1.6] mb-8 font-sans max-w-[90%]">
                                    {featuredPost.excerpt}
                                </p>

                                <div className="flex items-center gap-4 mb-8">
                                    {featuredPost.author?.avatar_url && (
                                        <div className="relative w-10 h-10 overflow-hidden bg-off-white">
                                            <Image
                                                src="/brand-logo.png"
                                                alt={featuredPost.author.name}
                                                fill
                                                className="object-cover"
                                                sizes="40px"
                                            />
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-[13px] text-black font-medium font-sans">{featuredPost.author?.name}</span>
                                        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-gray-mid">
                                            {new Date(featuredPost.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {commentCountMap[featuredPost.id] || 0} Comments
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <span className="inline-block px-8 py-3 bg-black text-white text-[11px] font-mono uppercase tracking-[0.08em] hover:bg-brand-red transition-colors duration-200">
                                        Read More
                                    </span>
                                </div>
                            </div>

                            {/* Image Right */}
                            <div className="w-full md:w-[55%] aspect-[4/3] relative overflow-hidden bg-off-white">
                                <Image
                                    src={featuredPost.cover_image_url}
                                    alt={featuredPost.cover_image_alt}
                                    fill
                                    priority
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, 60vw"
                                />
                            </div>

                        </div>
                    </Link>
                </section>
            )}
            {/* Subpage Anchor Header (Visible only on Page 2+) */}
            {currentPage > 1 && (
                <section className="max-w-[1280px] mx-auto px-4 md:px-6 pt-16 pb-12 border-b border-gray-light mb-12">
                    <div className="flex flex-col items-center justify-center text-center">
                        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-red font-bold mb-3">EXPLORE THE ARCHIVE</span>
                        <h1 className="font-display text-[32px] md:text-[42px] text-black uppercase tracking-tight leading-none">
                            All Guides & Insights — Page {currentPage}
                        </h1>
                    </div>
                </section>
            )}

            {/* 2 & 3. Main Feed (3-Column Grid) & Article Cards */}
            <section className={`max-w-[1280px] mx-auto px-4 md:px-6 ${currentPage > 1 ? 'pt-8' : 'pt-24'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 md:gap-y-16">
                    {gridPosts.map((post) => (
                        <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col h-full">
                            {/* Card Top: Image */}
                            <div className="w-full aspect-[4/3] relative overflow-hidden bg-off-white mb-8 border border-gray-light/50">
                                <Image
                                    src={post.cover_image_url}
                                    alt={post.cover_image_alt}
                                    fill
                                    className="object-cover transition-transform duration-[1s] group-hover:scale-110"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    loading="lazy"
                                />
                            </div>

                            {/* Card Middle: Category, Title, Excerpt */}
                            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-brand-red mb-3">
                                {post.category}
                            </span>

                            <h3 className="font-display text-[26px] md:text-[28px] leading-[1.1] text-black mb-4 group-hover:text-brand-red transition-colors tracking-tight">
                                {post.title}
                            </h3>

                            <p className="text-[14px] text-gray-mid line-clamp-2 mb-6 flex-grow font-sans leading-relaxed">
                                {post.excerpt}
                            </p>

                            {/* Card Bottom: Metadata */}
                            <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-light/50">
                                {post.author?.avatar_url && (
                                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-off-white flex-shrink-0">
                                        <Image
                                            src="/brand-logo.png"
                                            alt={post.author.name}
                                            fill
                                            className="object-cover"
                                            sizes="32px"
                                        />
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <span className="text-[12px] text-black font-medium font-sans leading-tight">
                                        {post.author?.name}
                                    </span>
                                    <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-gray-mid mt-0.5">
                                        {new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {commentCountMap[post.id] || 0} Comments
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* 4. Pagination Component */}
                <div className="mt-24 pt-8 border-t border-gray-light flex items-center justify-between">
                    <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                        {pageNumbers.map((p, idx) => {
                            if (p === '...') {
                                return (
                                    <span key={`ellipsis-${idx}`} className="w-8 md:w-10 flex items-center justify-center text-[13px] text-gray-mid">
                                        ...
                                    </span>
                                );
                            }
                            return (
                                <Link
                                    key={p}
                                    href={`/blog?page=${p}`}
                                    className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-[12px] md:text-[13px] font-mono border rounded-none transition-colors ${
                                        currentPage === p
                                            ? "bg-black text-white border-black cursor-default pointer-events-none"
                                            : "bg-white text-black border-gray-light hover:border-black"
                                    }`}
                                >
                                    {p}
                                </Link>
                            );
                        })}
                    </div>

                    {currentPage < totalPages ? (
                        <Link
                            href={`/blog?page=${currentPage + 1}`}
                            className="flex items-center justify-center px-4 md:px-6 h-8 md:h-10 bg-black text-white text-[10px] md:text-[11px] font-mono uppercase tracking-[0.08em] rounded-none hover:bg-brand-red transition-colors whitespace-nowrap"
                        >
                            Next &rarr;
                        </Link>
                    ) : (
                        <div className="w-16 md:w-24" />
                    )}
                </div>
            </section>

        </div>
    );
}
