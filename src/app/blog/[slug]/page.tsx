import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { Post } from "@/types/database.types";
import BlogMetaBar from "@/components/blog/BlogMetaBar";
import SocialShare from "@/components/blog/SocialShare";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Metadata } from "next";
import { Sparkles } from "lucide-react";
import ReadingProgressBar from "@/components/blog/ReadingProgressBar";
import FAQAccordion from "@/components/blog/FAQAccordion";
import BlogTOC from "@/components/blog/BlogTOC";
import EmbeddedToolClient from "@/components/blog/EmbeddedToolClient";
import React from "react";
import VisualStepTemplate from "@/components/blog/VisualStepTemplate";
import RelatedPosts from "@/components/blog/RelatedPosts";
import CommentSection from "@/components/blog/CommentSection";

const MarkdownComponents: any = {
    h2: ({children, ...props}: any) => {
        const text = children?.toString() || "";
        const id = text.toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");
        return <h2 id={id} className="text-[28px] font-display mt-16 mb-6 uppercase tracking-tight" {...props}>{children}</h2>;
    },
    h3: ({...props}: any) => <h3 className="text-[22px] font-display mt-12 mb-4" {...props} />,
    p: ({...props}: any) => <p className="mb-6 font-sans text-[18px] leading-[1.6] text-black/90 break-words" {...props} />,
    blockquote: ({children, ...props}: any) => {
        const text = children?.[0]?.props?.children?.[0] || children?.[0]?.props?.children || "";
        const isPullQuote = typeof text === 'string' && text.trim().startsWith("💡");
        if (isPullQuote) {
            return (
                <div className="bg-black text-white p-[24px_32px] my-12 border-l-4 border-brand-red font-display italic text-[22px] leading-[1.4] relative group">
                    {children}
                    <div className="mt-4 font-mono text-[10px] text-neutral-400 uppercase tracking-widest">SHARE THIS</div>
                </div>
            );
        }
        return (
            <blockquote className="border-l-[3px] border-brand-red pl-6 my-12 italic text-[22px] font-display text-black leading-[1.4]" {...props}>
                {children}
            </blockquote>
        );
    },
    div: ({className, children, ...props}: any) => {
        if (className === 'invest-block') {
            return (
                <div className="border border-brand-red bg-brand-red/[0.04] p-[20px_24px] my-8 relative">
                    <div className="font-mono text-[10px] text-brand-red uppercase mb-3 tracking-widest font-bold">FROM TATTOOSMAP</div>
                    <div className="font-sans text-[18px] leading-relaxed text-black/90">
                        {children}
                    </div>
                </div>
            );
        }
        return <div className={className} {...props}>{children}</div>;
    },
    ul: ({...props}: any) => <ul className="list-disc pl-6 mb-6 space-y-3" {...props} />,
    ol: ({...props}: any) => <ol className="list-decimal pl-5 mb-6 space-y-3 font-sans text-[18px] leading-[1.6]" {...props} />,
    li: ({...props}: any) => <li className="font-sans" {...props} />,
    pre: ({...props}: any) => <pre className="bg-off-white p-6 whitespace-pre-wrap break-words my-8 border border-gray-light font-mono text-[14px] leading-relaxed" {...props} />,
    code: ({...props}: any) => <code className="bg-off-white px-1 py-0.5 font-mono text-[0.9em] whitespace-pre-wrap break-words" {...props} />,
    table: ({...props}: any) => <div className="overflow-x-auto mb-[32px] mt-8"><table className="w-full text-left border-collapse border border-gray-light font-sans text-[16px]" {...props} /></div>,
    th: ({...props}: any) => <th className="bg-off-white border border-gray-light p-4 font-bold text-black uppercase text-[12px] tracking-widest font-mono" {...props} />,
    td: ({...props}: any) => <td className="border border-gray-light p-4 text-black/80 font-sans" {...props} />,
    img: ({ src, alt, ...props }: any) => {
        if (!src) return null;
        return (
            <div className="my-[48px] space-y-4">
                <div className="aspect-video relative overflow-hidden bg-off-white border border-gray-light">
                    <Image
                        src={src}
                        alt={alt || ""}
                        fill
                        sizes="(max-width: 768px) 100vw, 680px"
                        className="object-cover"
                        {...props}
                    />
                </div>
                {alt && <p className="font-mono text-[11px] text-neutral-400 text-center uppercase tracking-widest leading-relaxed">{alt}</p>}
            </div>
        );
    }
};

function renderContentWithTools(content: string) {
    if (!content) return null;
    
    // Split content on :::tool[TOOL_ID]::: markers
    const parts = content.split(/:::tool\[([^\]]+)\]:::/g);
    
    return parts.map((part, index) => {
        // Even indexes are content, odd indexes are tool IDs
        if (index % 2 === 0) {
            // Regular content
            return part ? (
                <ReactMarkdown 
                    key={index} 
                    remarkPlugins={remarkPluginsList} 
                    rehypePlugins={[rehypeRaw]}
                    components={MarkdownComponents}
                >
                    {part.replace(/:::invest\n([\s\S]*?)\n:::/g, "<div class=\"invest-block\">\n\n$1\n\n</div>")}
                </ReactMarkdown>
            ) : null;
        } else {
            // Tool marker — render the tool component via EmbeddedToolClient
            return (
                <div key={index} className="my-12">
                    <EmbeddedToolClient toolName={part} />
                </div>
            );
        }
    });
}

const remarkPluginsList = [remarkGfm];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createClient();
    const { data: post } = await supabase
        .from("posts")
        .select("title, meta_title, meta_description, excerpt, cover_image_url")
        .eq("slug", slug)
        .single();
    
    const title = post?.meta_title || post?.title || "Blog Post";
    const description = post?.meta_description || post?.excerpt || "Tattoo inspiration and guides from TattoosMap.";
    const imageUrl = post?.cover_image_url || "/brand-logo.png";
    
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "article",
            images: imageUrl ? [{ url: imageUrl }] : [],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: imageUrl ? [imageUrl] : [],
        }
    };
}


export const revalidate = 300; // Cache blog detail pages for 5 minutes

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient();
    
    let post: Post = null as any;
    let relatedPosts = [];
    let comments: any[] = [];

    try {
        // 1. Fetch the primary post
        const { data: livePost, error } = await supabase
            .from("posts")
            .select("*")
            .eq("slug", slug)
            .eq("is_published", true)
            .is("deleted_at", null)
            .single();

        if (!error && livePost) {
            let profile: any = {};
            if (livePost.author_id) {
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (uuidRegex.test(livePost.author_id)) {
                    const { data: profileData } = await supabase
                        .from("profiles")
                        .select("id, username, avatar_url, bio")
                        .eq("id", livePost.author_id)
                        .single();
                    if (profileData) profile = profileData;
                }
            }

            post = {
                ...livePost,
                author: {
                    id: profile.id || livePost.author_id || "a1",
                    name: profile.username || profile.name || "TattoosMap Editorial",
                    avatar_url: profile.avatar_url || "/brand-logo.png",
                    bio: profile.bio || "The official editorial voice of TattoosMap."
                }
            };

            const currentPost = post!;

            // 2. Smart Hybrid Recommendation Algorithm (Collaborative + Content Scoring)
            let finalRelated: any[] = [];
            try {
                // TIER 1: Attempt high-perf SQL engine first
                const { data: rpcRelated, error: rpcError } = await supabase
                    .rpc('get_smart_related_posts', {
                        current_post_id: currentPost.id,
                        target_category: currentPost.category || "",
                        target_tags: currentPost.tags || [],
                        limit_count: 3
                    });
                
                if (!rpcError && rpcRelated && rpcRelated.length > 0) {
                    finalRelated = rpcRelated;
                } else {
                    throw new Error("SQL Engine missing or empty, falling back to JS handler");
                }
            } catch (e) {
                // TIER 2: JS Score-based Content Matching (Fallback)
                const { data: allOthers } = await supabase
                    .from("posts")
                    .select("*")
                    .neq("id", currentPost.id)
                    .eq("is_published", true)
                    .is("deleted_at", null)
                    .limit(20); // Fetch candidate pool

                if (allOthers && allOthers.length > 0) {
                    const currentTags = currentPost.tags || [];
                    const scoredPosts = allOthers.map(p => {
                        let score = 0;
                        // Match category: +10
                        if (p.category && currentPost.category && p.category === currentPost.category) score += 10;
                        // Match tags: +5 each
                        const matchTags = (p.tags || []).filter((t: string) => currentTags.includes(t));
                        score += matchTags.length * 5;
                        return { ...p, matchScore: score };
                    });
                    // Sort by total score, then by date recency
                    finalRelated = scoredPosts
                        .sort((a, b) => (b.matchScore - a.matchScore) || (new Date(b.published_at).getTime() - new Date(a.published_at).getTime()))
                        .slice(0, 3);
                }
            }

            if (finalRelated.length > 0) {
                relatedPosts = finalRelated;
            } else {
                relatedPosts = [];
            }

            // 3. Fetch Approved Comments (wrapped defensively in case table isn't pushed yet)
            try {
                const { data: liveComments } = await supabaseAdmin
                    .from("blog_comments")
                    .select("id, author_name, content, created_at, is_admin_reply, image_url")
                    .eq("post_id", currentPost.id)
                    .eq("is_approved", true)
                    .order("created_at", { ascending: true });
                
                if (liveComments) comments = liveComments;
            } catch (e) { /* Table missing, ignore */ }

        } else {
            post = null as any;
            relatedPosts = [];
        }
    } catch (err) {
        console.error("[BLOG SINGLE] Error:", err);
        post = null as any;
        relatedPosts = [];
    }

    if (!post) {
        notFound();
    }

    // JSON-LD Generation based on schema_type
    const jsonLd: any = {
        "@context": "https://schema.org",
        "@type": post.schema_type || "Article",
        "headline": post.title,
        "image": post.cover_image_url,
        "author": {
            "@type": "Person",
            "name": post.author?.name
        },
        "datePublished": post.published_at,
        "description": post.excerpt
    };

    if (post.schema_type === "HowTo") {
        jsonLd.step = [{
            "@type": "HowToStep",
            "text": "Check the guide content for detailed steps."
        }];
    } else if (post.schema_type === "FAQPage") {
        jsonLd["@type"] = "FAQPage";
        jsonLd.mainEntity = [{
            "@type": "Question",
            "name": post.title,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": post.excerpt
            }
        }];
    }

    const configRegex = /:::config\n([\s\S]*?)\n:::/;
    const configMatch = post.body_content ? post.body_content.match(configRegex) : null;
    let customConfig: any = {};
    if (configMatch) {
        try { customConfig = JSON.parse(configMatch[1]); } catch (e) {}
    }
    const headings = customConfig.headings || {};
    const displayBodyContent = post.body_content ? post.body_content.replace(configRegex, "") : "";

    const wordCount = displayBodyContent.trim().split(/\s+/).length;
    const h2Count = (displayBodyContent.match(/^##\s/gm) || []).length;
    const isLongForm = wordCount >= 1500 && h2Count >= 3;
    const isRecommendAndSell = post.post_intent === "RECOMMEND AND SELL";
    const hasToolMarkers = post.tool_markers && post.tool_markers.length > 0;
    const hasLegacyTool = post.selected_tool && post.selected_tool !== 'NONE' && !hasToolMarkers;

    // EXTRACT SPECIAL BLOCKS FROM MARKDOWN FOR VISUAL GUIDES
    const investRegex = /:::invest\n([\s\S]*?)\n:::/;
    const investMatch = displayBodyContent.match(investRegex);
    const extractedInvest = investMatch ? investMatch[1].trim() : "";

    const saRegex = /:::shortanswer\n([\s\S]*?)\n:::/;
    const saMatch = displayBodyContent.match(saRegex);
    const extractedShortAnswer = saMatch ? saMatch[1].trim() : (post.excerpt || "");

    if (post.post_template_type === "VISUAL STEP GUIDE") {
        const mappedSteps = (post.visual_steps || []).map((step: any, idx: number) => ({
            id: step.id || `step-${idx}`,
            number: step.number || `0${idx + 1}`,
            title: step.title || "",
            content: step.content || "",
            imageSrc: step.imageSrc || "",
            imageAlt: step.imageAlt || "",
            tip: step.tip || "",
            tipType: step.tipType || "tip"
        }));

        return (
            <VisualStepTemplate
                isAdmin={false}
                postType="VISUAL STEP GUIDE"
                badge={post.category || "VISUAL GUIDE"}
                readTime={`${post.read_time_minutes || 6} MIN READ`}
                title={post.title}
                executiveSummary={post.excerpt || ""}
                shortAnswer={extractedShortAnswer}
                heroImageSrc={post.cover_image_url}
                heroImageAlt={post.cover_image_alt || post.title}
                scienceHeading={post.science_heading || "Why This Matters — The Science"}
                scienceContent={post.science_content || ""}
                pullQuote={post.pull_quote || ""}
                steps={mappedSteps}
                faqItems={post.faq_items || []}
                investContent={extractedInvest}
                shortAnswerHeading={headings.shortAnswer}
                relatedPosts={relatedPosts}
                postId={post.id}
                comments={comments}
            />
        );
    }

    return (
        <div className="w-full bg-white">
            <ReadingProgressBar />

            <header className="flex flex-col">
                <div className="max-w-[720px] mx-auto pt-12 md:pt-20 px-5 text-center order-1 md:order-2">
                    <div className="flex justify-center gap-4 items-center mb-8 order-1">
                        <span className="font-mono text-[10px] md:text-[11px] uppercase text-brand-red border border-brand-red/30 px-3 py-1 tracking-widest transition-colors hover:bg-brand-red hover:text-white">
                            {post.category || "General"}
                        </span>
                        <span className="font-mono text-[11px] text-neutral-400 uppercase tracking-widest">{post.read_time_minutes || 0} MIN READ</span>
                    </div>

                    <h1 className="font-display text-[36px] md:text-[56px] lg:text-[72px] leading-[1] text-black mb-10 tracking-tight order-2">
                        {post.title}
                    </h1>

                    <div className="italic text-[18px] md:text-[20px] border-l-[3px] border-brand-red pl-6 md:pl-8 text-left text-black/90 leading-[1.6] mb-12 order-3">
                        {post.meta_description || post.excerpt}
                    </div>


                    <div className="font-mono text-[10px] text-neutral-400 mb-8 uppercase tracking-widest text-center leading-relaxed order-4">
                        By TattoosMap Editorial — {new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        {post.related_products && post.related_products.length > 0 && (
                            <span className="block mt-1">
                                Contains affiliate links — commission earned at no extra cost to you
                            </span>
                        )}
                    </div>
                </div>
                <div className="w-full relative aspect-[16/9] md:aspect-[21/9] lg:aspect-[3/1] max-h-[60vh] md:max-h-[500px] group overflow-hidden bg-black order-2 md:order-1">
                    <Image
                        src={post.cover_image_url}
                        alt={post.cover_image_alt}
                        fill
                        priority
                        className="object-cover opacity-90 transition-transform duration-[2s] group-hover:scale-105"
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
            </header>

            <article className="max-w-[1280px] mx-auto px-5 pb-32">

                <div className={`flex flex-col ${isLongForm ? 'lg:flex-row lg:gap-16 lg:justify-center' : 'items-center'}`}>
                    <main className="w-full max-w-[680px]">
                        {isRecommendAndSell ? (
                          <>
                            {/* SHORT ANSWER CONTENT */}
                            {headings.shortAnswer !== "" && (
                              <h2 id="auto-short-answer" className="font-display text-[28px] uppercase tracking-tight text-black mb-4 mt-12 text-center">
                                {headings.shortAnswer || "The Short Answer"}
                              </h2>
                            )}
                            <div className="prose prose-lg max-w-none break-words">
                                {renderContentWithTools(displayBodyContent)}
                            </div>

                            {/* RANKED LIST */}
                            {post.related_products && post.related_products.length > 0 && (
                              <div className="space-y-6 mb-16 mt-16">
                                {headings.rankedList !== "" && (
                                  <h2 className="font-display text-[28px] uppercase tracking-tight text-black mb-4 text-center">
                                    {headings.rankedList || "The Ranked List"}
                                  </h2>
                                )}
                                <p className="font-mono text-[9px] md:text-[11px] text-neutral-400 uppercase tracking-widest text-center mb-12 opacity-80 leading-relaxed">
                                    DISCLOSURE: This post contains affiliate links. If you purchase through our links we may earn a small commission at no extra cost to you.
                                </p>
                                {post.related_products.map((product: any, idx: number) => (
                                  <div key={idx} id={product.name?.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').substring(0, 80)} className="border border-gray-light p-6 relative bg-white flex flex-col items-start gap-1 scroll-mt-24">
                                    <span className="font-display text-[48px] text-neutral-200 leading-none absolute top-6 right-6">
                                      {product.rank || idx + 1}
                                    </span>
                                    <h3 className="font-display text-[22px] text-black pr-12 mb-1">{product.name}</h3>
                                    <span className="font-mono text-[10px] uppercase text-brand-red bg-brand-red/5 px-2 py-0.5 tracking-wider mb-3">
                                      {product.tag || product.badge}
                                    </span>
                                    {((product.image_url && product.image_url.trim() !== '') || (product.imageSrc && product.imageSrc.trim() !== '')) && (
                                      <div className="w-full aspect-[2/1] relative mb-6 bg-off-white border border-gray-light overflow-hidden">
                                        <Image
                                          src={product.image_url || product.imageSrc}
                                          alt={product.imageAlt || product.name}
                                          fill
                                          sizes="(max-width: 768px) 100vw, 680px"
                                          className="object-cover"
                                        />
                                      </div>
                                    )}
                                    <p className="font-sans text-[15px] leading-[1.6] text-black/90 mb-4">{product.description}</p>
                                    {product.honest_limitation && (
                                      <div className="w-full bg-neutral-50 border-l-2 border-neutral-200 p-4 mb-6">
                                        <span className="font-mono text-[9px] uppercase text-neutral-400 tracking-widest block mb-2 font-bold">
                                          HONEST LIMITATION
                                        </span>
                                        <p className="font-sans text-[13px] text-neutral-600 italic">{product.honest_limitation}</p>
                                      </div>
                                    )}
                                    <div className="flex items-center justify-between w-full mt-auto pt-4 border-t border-gray-light">
                                      <span className="font-mono text-[14px] text-black font-bold">{product.price}</span>
                                      
                                      <a
                                        href={(product.url || product.affiliateUrl) && (product.url || product.affiliateUrl) !== '#affiliate' && (product.url || product.affiliateUrl) !== '#' ? (product.url || product.affiliateUrl) : undefined}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`bg-black text-white font-mono text-[10px] uppercase px-5 py-2 transition-colors whitespace-nowrap ${(!(product.url || product.affiliateUrl) || (product.url || product.affiliateUrl) === '#affiliate' || (product.url || product.affiliateUrl) === '#') ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-900'}`}
                                      >
                                        {product.button_label || product.buttonLabel || "VIEW ON AMAZON"}
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* LEGACY TOOL FALLBACK */}
                            {hasLegacyTool && (
                                <div className="my-12">
                                    <EmbeddedToolClient 
                                        toolName={post.selected_tool || ""} 
                                    />
                                </div>
                            )}

                            {/* SCIENCE SECTION */}
                            {post.science_content && (
                              <div className="relative mb-12">
                                <h2 className="font-display text-[28px] uppercase tracking-tight text-black mb-4 mt-12 text-center">
                                  {post.science_heading || "Why This Matters"}
                                </h2>
                                <p className="font-sans text-[17px] leading-[1.5] text-black/90 mb-12">
                                  {post.science_content}
                                </p>
                              </div>
                            )}

                            {/* PULL QUOTE */}
                            {post.pull_quote && (
                              <div className="border-l-4 border-brand-red bg-black p-6 my-12">
                                <span className="font-mono text-[9px] uppercase text-neutral-500 tracking-widest block mb-3">SHARE THIS</span>
                                <p className="font-display text-[20px] text-white italic leading-snug">
                                  "{post.pull_quote}"
                                </p>
                              </div>
                            )}

                            {/* INVEST BLOCK */}
                            <div className="border border-brand-red p-6 my-8" style={{background: 'rgba(226,75,74,0.04)'}}>
                              <span className="font-mono text-[9px] uppercase text-brand-red tracking-widest block mb-3">FROM TATTOOSMAP</span>
                              <p className="font-sans text-[15px] leading-relaxed text-black">
                                Already have your design? Each design in our library includes the recommended aftercare protocol for its specific style and placement.{' '}
                                <a href="/gallery" className="underline decoration-brand-red underline-offset-4 hover:text-brand-red transition-colors font-medium">
                                  Browse verified designs →
                                </a>
                              </p>
                            </div>

                            {/* PROTOCOL STEPS */}
                            {post.protocol_steps && post.protocol_steps.length > 0 && (
                              <>
                                {headings.protocol !== "" && (
                                  <h2 className="font-display text-[28px] md:text-[32px] uppercase tracking-tight text-black mb-12 mt-20 text-center">
                                    {headings.protocol || "Exactly What To Do, Day by Day"}
                                  </h2>
                                )}
                                <div className="space-y-8 mb-16">
                                  {post.protocol_steps.map((step: any, idx: number) => (
                                    <div key={idx} className="flex gap-6">
                                      <span className="font-mono text-[10px] text-brand-red mt-1 shrink-0">{step.number}</span>
                                      <div>
                                        <h3 className="font-display text-[17px] text-black mb-2 uppercase tracking-tight">{step.title}</h3>
                                        <p className="font-sans text-[15px] text-black/70 leading-relaxed">{step.content}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}

                            {/* WHAT TO NEVER USE */}
                            {post.avoid_items && post.avoid_items.length > 0 && (
                              <>
                                {headings.avoid !== "" && (
                                  <h2 className="font-display text-[28px] md:text-[32px] uppercase tracking-tight text-black mb-12 mt-20 text-center">
                                    {headings.avoid || "What To Never Use"}
                                  </h2>
                                )}
                                <div className="space-y-4 mb-12">
                                  {post.avoid_items.map((entry: any, idx: number) => (
                                    <div key={idx} className="flex gap-4 border-l-2 border-brand-red pl-4 py-2">
                                      <div>
                                        <p className="font-display text-[15px] text-black mb-1">{entry.item}</p>
                                        <p className="font-sans text-[13px] text-black/60 leading-relaxed">{entry.reason}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}

                            {/* FAQ */}
                            {post.faq_items && post.faq_items.length > 0 && (
                              <>
                                {headings.faq !== "" && (
                                  <h2 className="font-display text-[28px] md:text-[32px] uppercase tracking-tight text-black mb-12 mt-20 text-center">
                                      {headings.faq || "Frequently Asked Questions"}
                                  </h2>
                                )}
                                <div className="space-y-0">
                                  {post.faq_items.map((item: any, idx: number) => (
                                    <FAQAccordion key={idx} question={item.question} answer={item.answer} />
                                  ))}
                                </div>
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            {/* DISCLOSURE FOR INFO POSTS */}
                            <p className="font-mono text-[9px] md:text-[11px] text-neutral-400 uppercase tracking-widest text-center mb-12 opacity-80 leading-relaxed">
                              DISCLOSURE: This post contains affiliate links. If you purchase through our links we may earn a small commission at no extra cost to you.
                            </p>

                            {/* SCIENCE SECTION */}
                            {post.science_content && (
                              <div className="relative mb-12">
                                <h2 className="font-display text-[28px] uppercase tracking-tight text-black mb-4 mt-12 text-center">
                                  {post.science_heading || "Why This Matters"}
                                </h2>
                                <p className="font-sans text-[17px] leading-[1.5] text-black/90 mb-12">
                                  {post.science_content}
                                </p>
                              </div>
                            )}

                            {/* PULL QUOTE */}
                            {post.pull_quote && (
                              <div className="border-l-4 border-brand-red bg-black p-6 my-12">
                                <span className="font-mono text-[9px] uppercase text-neutral-500 tracking-widest block mb-3">SHARE THIS</span>
                                <p className="font-display text-[20px] text-white italic leading-snug">
                                  "{post.pull_quote}"
                                </p>
                              </div>
                            )}

                            {/* INVEST BLOCK */}
                            <div className="border border-brand-red p-6 my-8" style={{background: 'rgba(226,75,74,0.04)'}}>
                              <span className="font-mono text-[9px] uppercase text-brand-red tracking-widest block mb-3">FROM TATTOOSMAP</span>
                              <p className="font-sans text-[15px] leading-relaxed text-black">
                                Already have your design? Each design in our library includes the recommended aftercare protocol for its specific style and placement.{' '}
                                <a href="/gallery" className="underline decoration-brand-red underline-offset-4 hover:text-brand-red transition-colors font-medium">
                                  Browse verified designs →
                                </a>
                              </p>
                            </div>

                            {/* LEGACY TOOL FALLBACK */}
                            {hasLegacyTool && (
                                <div className="my-12">
                                    <EmbeddedToolClient 
                                        toolName={post.selected_tool || ""} 
                                    />
                                </div>
                            )}

                            {/* MAIN CONTENT */}
                            {headings.shortAnswer !== "" && (
                              <h2 id="auto-short-answer" className="font-display text-[28px] uppercase tracking-tight text-black mb-4 mt-12 text-center">
                                {headings.shortAnswer || "The Short Answer"}
                              </h2>
                            )}
                            <div className="prose prose-lg max-w-none break-words">
                                {renderContentWithTools(displayBodyContent)}
                            </div>

                            {/* PROTOCOL STEPS */}
                            {post.protocol_steps && post.protocol_steps.length > 0 && (
                              <>
                                {headings.protocol !== "" && (
                                  <h2 className="font-display text-[28px] md:text-[32px] uppercase tracking-tight text-black mb-12 mt-20 text-center">
                                    {headings.protocol || "Exactly What To Do, Day by Day"}
                                  </h2>
                                )}
                                <div className="space-y-8 mb-16">
                                  {post.protocol_steps.map((step: any, idx: number) => (
                                    <div key={idx} className="flex gap-6">
                                      <span className="font-mono text-[10px] text-brand-red mt-1 shrink-0">{step.number}</span>
                                      <div>
                                        <h3 className="font-display text-[17px] text-black mb-2 uppercase tracking-tight">{step.title}</h3>
                                        <p className="font-sans text-[15px] text-black/70 leading-relaxed">{step.content}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}

                            {/* WHAT TO NEVER USE */}
                            {post.avoid_items && post.avoid_items.length > 0 && (
                              <>
                                {headings.avoid !== "" && (
                                  <h2 className="font-display text-[28px] md:text-[32px] uppercase tracking-tight text-black mb-12 mt-20 text-center">
                                    {headings.avoid || "What To Never Use"}
                                  </h2>
                                )}
                                <div className="space-y-4 mb-12">
                                  {post.avoid_items.map((entry: any, idx: number) => (
                                    <div key={idx} className="flex gap-4 border-l-2 border-brand-red pl-4 py-2">
                                      <div>
                                        <p className="font-display text-[15px] text-black mb-1">{entry.item}</p>
                                        <p className="font-sans text-[13px] text-black/60 leading-relaxed">{entry.reason}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}

                            {/* FAQ */}
                            {post.faq_items && post.faq_items.length > 0 && (
                              <>
                                {headings.faq !== "" && (
                                  <h2 className="font-display text-[28px] md:text-[32px] uppercase tracking-tight text-black mb-12 mt-20 text-center">
                                      {headings.faq || "Frequently Asked Questions"}
                                  </h2>
                                )}
                                <div className="space-y-0">
                                  {post.faq_items.map((item: any, idx: number) => (
                                    <FAQAccordion key={idx} question={item.question} answer={item.answer} />
                                  ))}
                                </div>
                              </>
                            )}
                          </>
                        )}


                        <div className="mt-24 pt-8 border-t border-gray-light">
                            <SocialShare 
                                title={post.title} 
                                url={`https://tattoosmap.com/blog/${post.slug}`} 
                            />
                        </div>
                    </main>

                    {isLongForm && (
                        <BlogTOC content={displayBodyContent} isSidebar />
                    )}
                </div>
            </article>

            {/* COMMENT DISCUSSION */}
            <CommentSection postId={post.id} comments={comments} />

            {/* DYNAMIC PRIMARY CTA BASED ON INTENT (FIX 3.3) */}
            <section className="w-full bg-black py-[80px] px-5 text-center">
                {post.post_intent === "INFORM AND REFER" ? (
                    <div className="max-w-[540px] mx-auto flex flex-col items-center">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4 border border-neutral-800 px-3 py-1">
                            TATTOOSMAP VERIFIED CLINICS
                        </span>
                        <h2 className="font-display text-[32px] md:text-[40px] text-white mb-4 leading-[1.1] uppercase">
                            Ready To Start?
                        </h2>
                        <p className="font-sans text-[17px] text-neutral-400 mb-10 leading-relaxed">
                            Get a free consultation quote from a verified removal clinic. No commitment, just a real price for your specific tattoo.
                        </p>
                        <Link 
                            href="/clinics"
                            className="bg-brand-red text-white font-mono text-[12px] uppercase tracking-widest px-10 py-5 rounded-none hover:brightness-110 transition-all"
                        >
                            FIND A CLINIC NEAR YOU
                        </Link>
                        <p className="mt-8 font-mono text-[11px] text-neutral-500 max-w-[360px] mx-auto leading-relaxed">
                            TattoosMap earns a referral fee if you book. This does not affect the price you pay.
                        </p>
                    </div>
                ) : (
                    <div className="max-w-[540px] mx-auto flex flex-col items-center">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4 border border-neutral-800 px-3 py-1">
                            TATTOOSMAP DESIGN LIBRARY
                        </span>
                        <h2 className="font-display text-[32px] md:text-[40px] text-white mb-4 leading-[1.1] uppercase">
                            Find Your Perfect Design
                        </h2>
                        <p className="font-sans text-[17px] text-neutral-400 mb-10 leading-relaxed">
                            Browse verified designs, see how they age over 5 years, and save your favorites before your consultation.
                        </p>
                        <Link 
                            href={post.focus_keyword && ["butterfly", "snake", "lotus", "dragon", "rose"].includes(post.focus_keyword.toLowerCase())
                                ? `/meaning/${post.focus_keyword.toLowerCase().replace(/\s+/g, '-')}`
                                : "/gallery"}
                            className="bg-brand-red text-white font-mono text-[12px] uppercase tracking-widest px-10 py-5 rounded-none hover:brightness-110 transition-all"
                        >
                            EXPLORE THE GALLERY →
                        </Link>
                    </div>
                )}
            </section>



            {/* Schema Injection */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* UNIFIED RELATED POSTS */}
            <RelatedPosts posts={relatedPosts} />
        </div>
    );
}
