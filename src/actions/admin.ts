"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-server";
import { ADMIN_EMAILS } from "@/lib/admin";
import { verifyAdminSession } from "@/lib/admin-server";
import sharp from "sharp";

// Interfaces to replace 'any'
export interface RelatedProductInput {
    name: string;
    price: string | number;
    affiliateUrl?: string;
    url?: string;
    imageSrc?: string;
    image_url?: string;
    buttonLabel?: string;
    button_label?: string;
    badge?: string;
    tag?: string;
    description?: string;
    rank?: number | string;
    honest_limitation?: string;
}

export interface LabPostPayload {
    title?: string;
    slug?: string | null;
    excerpt?: string;
    body_content?: string;
    meta_title?: string;
    meta_description?: string;
    focus_keyword?: string;
    schema_type?: string;
    category?: string;
    post_intent?: string | null;
    cover_image_url?: string | null;
    cover_image_alt?: string | null;
    related_products?: RelatedProductInput[];
    protocol_steps?: any[] | string[];
    avoid_items?: any[] | string[];
    faq_items?: any[];
    pull_quote?: string | null;
    science_heading?: string | null;
    science_content?: string | null;
    selected_tool?: string;
    tool_position?: string | null;
    tool_markers?: any[] | string;
    read_time_minutes?: number;
    is_published?: boolean;
    author_id?: string;
    visual_steps?: any[] | string[];
    post_template_type?: string;
    sync_products?: boolean;
    published_at?: string;
}

export interface ProductPayload {
    name: string;
    slug: string;
    price: string | number;
    affiliate_url: string;
    image_url?: string | null;
    button_label?: string;
    tag?: string | null;
    description?: string | null;
    category?: string;
    source_post_slug?: string | null;
}

/**
 * Loop-based slug uniqueness verification.
 * Checks against existing slugs and appends/regenerates a 4-character suffix up to 10 times in case of collision.
 */
async function ensureUniqueSlug(table: "posts" | "designs", baseSlug: string): Promise<string> {
    let slug = baseSlug.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').substring(0, 80);
    if (!slug) {
        slug = "untitled";
    }
    
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
        const { data, error } = await supabaseAdmin
            .from(table)
            .select("slug")
            .eq("slug", slug)
            .maybeSingle();
            
        if (!data && !error) {
            return slug;
        }
        
        // Strip any existing 4-character suffix and append a new one
        const cleanBase = slug.replace(/-[a-z0-9]{4,5}$/, "");
        const suffix = Math.random().toString(36).substring(2, 6);
        slug = `${cleanBase}-${suffix}`;
        attempts++;
    }
    
    throw new Error(`Failed to generate a unique slug for table ${table} after ${maxAttempts} attempts.`);
}

export async function updateDesignAction(formData: FormData) {
    try {
        await verifyAdminSession();

        const id = formData.get("id") as string;
        const subject = formData.get("subject") as string;
        const alt_text = formData.get("alt_text") as string;
        const slug = formData.get("slug") as string;
        const current_image_url = formData.get("current_image_url") as string;
        const file = formData.get("image") as File | null;

        let finalImageUrl = current_image_url;

        if (file && file.size > 0) {
            const fileExt = file.name.split(".").pop();
            const fileName = `${slug}-${Date.now()}.${fileExt}`;
            const fileBuffer = Buffer.from(await file.arrayBuffer());

            const { error: uploadError } = await supabaseAdmin.storage
                .from("designs")
                .upload(fileName, fileBuffer, {
                    contentType: file.type,
                    cacheControl: "3600",
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabaseAdmin.storage
                .from("designs")
                .getPublicUrl(fileName);
            
            finalImageUrl = publicUrl;
        }

        const { error } = await supabaseAdmin
            .from("designs")
            .update({
                subject,
                alt_text,
                image_url: finalImageUrl
            })
            .eq("id", id);

        if (error) throw error;

        revalidatePath("/gallery");
        revalidatePath(`/gallery/[id]`, "page");
        
        return { success: true };
    } catch (err: any) {
        console.error("[updateDesignAction] Fatal Error:", err);
        return { 
            success: false, 
            error: `DB ERROR: ${err.message}`
        };
    }
}

export async function revalidateDesignPath() {
    try {
        await verifyAdminSession();
        revalidatePath("/gallery");
        revalidatePath(`/gallery/[id]`, "page");
    } catch (err: any) {
        console.error("[revalidateDesignPath] Unauthorized:", err);
    }
}

export async function toggleDesignPublishAction(id: string, isPublished: boolean) {
    try {
        await verifyAdminSession();

        const { error } = await supabaseAdmin
            .from("designs")
            .update({ is_published: isPublished })
            .eq("id", id);

        if (error) throw error;

        revalidatePath("/admin/manage");
        revalidatePath("/gallery");
        revalidatePath(`/gallery/[id]`, "page");

        return { success: true };
    } catch (err: any) {
        console.error("[toggleDesignPublishAction] Fatal Error:", err);
        return { success: false, error: err.message };
    }
}

export async function togglePostPublishAction(id: string, isPublished: boolean) {
    try {
        await verifyAdminSession();

        const { error } = await supabaseAdmin
            .from("posts")
            .update({ is_published: isPublished })
            .eq("id", id);

        if (error) throw error;

        revalidatePath("/admin/manage");
        revalidatePath("/blog");
        revalidatePath(`/blog/[slug]`, "page");

        return { success: true };
    } catch (err: any) {
        console.error("[togglePostPublishAction] Fatal Error:", err);
        return { success: false, error: err.message };
    }
}

export async function batchTogglePublishAction(type: 'design' | 'post', ids: string[], isPublished: boolean) {
    try {
        await verifyAdminSession();

        const table = type === 'design' ? 'designs' : 'posts';
        const { error } = await supabaseAdmin
            .from(table)
            .update({ is_published: isPublished })
            .in("id", ids);

        if (error) throw error;

        revalidatePath("/admin/manage");
        if (type === 'design') {
            revalidatePath("/gallery");
            revalidatePath(`/gallery/[id]`, "page");
        } else {
            revalidatePath("/blog");
            revalidatePath(`/blog/[slug]`, "page");
        }

        return { success: true };
    } catch (err: any) {
        console.error("[batchTogglePublishAction] Fatal Error:", err);
        return { success: false, error: err.message };
    }
}

export async function permanentDeleteAction(type: 'design' | 'post', ids: string[]) {
    try {
        await verifyAdminSession();

        const table = type === 'design' ? 'designs' : 'posts';
        
        if (type === 'design') {
            const { data: designs } = await supabaseAdmin
                .from('designs')
                .select('image_url, image_fresh_url, image_healed_url')
                .in('id', ids);
            
            if (designs && designs.length > 0) {
                const designsPaths: string[] = [];
                const mastersPaths: string[] = [];

                designs.forEach(d => {
                    if (d.image_url) {
                        const primaryPath = d.image_url.split('/public/designs/')[1];
                        if (primaryPath) {
                            designsPaths.push(primaryPath);
                            mastersPaths.push(primaryPath);
                            const thumbPath = `thumbs/${primaryPath.replace('.webp', '-thumb.webp')}`;
                            designsPaths.push(thumbPath);
                        }
                    }

                    if (d.image_fresh_url) {
                        const freshPath = d.image_fresh_url.split('/public/designs/')[1];
                        if (freshPath) designsPaths.push(freshPath);
                    }

                    if (d.image_healed_url) {
                        const healedPath = d.image_healed_url.split('/public/designs/')[1];
                        if (healedPath) designsPaths.push(healedPath);
                    }
                });

                if (designsPaths.length > 0) {
                    const { error: designsStorageErr } = await supabaseAdmin.storage
                        .from('designs')
                        .remove(designsPaths);
                    if (designsStorageErr) {
                        console.error("[permanentDeleteAction] Error cleaning designs bucket:", designsStorageErr.message);
                    }
                }

                if (mastersPaths.length > 0) {
                    const { error: mastersStorageErr } = await supabaseAdmin.storage
                        .from('masters')
                        .remove(mastersPaths);
                    if (mastersStorageErr) {
                        console.error("[permanentDeleteAction] Error cleaning masters bucket:", mastersStorageErr.message);
                    }
                }
            }

            const { error: coverUpdateErr } = await supabaseAdmin
                .from('collections')
                .update({ cover_design_id: null })
                .in('cover_design_id', ids);
                
            if (coverUpdateErr) {
                console.error("[permanentDeleteAction] Error nullifying collection covers:", coverUpdateErr);
            }

            try {
                const { data: collections } = await supabaseAdmin
                    .from('collections')
                    .select('id, design_ids');
                
                if (collections && collections.length > 0) {
                    for (const col of collections) {
                        const originalIds = col.design_ids || [];
                        const filteredIds = originalIds.filter((id: string) => !ids.includes(id));
                        if (filteredIds.length !== originalIds.length) {
                            await supabaseAdmin
                                .from('collections')
                                .update({ design_ids: filteredIds })
                                .eq('id', col.id);
                        }
                    }
                }
            } catch (colErr) {
                console.error("[permanentDeleteAction] Error cleaning design_ids in collections:", colErr);
            }

            const { error: savesError } = await supabaseAdmin
                .from('user_saves')
                .delete()
                .in('design_id', ids);
                
            if (savesError) {
                console.error("[permanentDeleteAction] Error clearing user_saves:", savesError);
            }
        }

        const { error } = await supabaseAdmin
            .from(table)
            .delete()
            .in('id', ids);

        if (error) throw error;

        revalidatePath("/admin/manage");
        if (type === 'design') {
            revalidatePath("/gallery");
            revalidatePath(`/gallery/[id]`, "page");
        } else {
            revalidatePath("/blog");
            revalidatePath(`/blog/[slug]`, "page");
        }

        return { success: true };
    } catch (err: any) {
        console.error("[permanentDeleteAction] Fatal Error:", err);
        return { success: false, error: err.message };
    }
}

export async function updatePostAction(formData: FormData) {
    try {
        await verifyAdminSession();

        const id = formData.get("id") as string;
        const title = formData.get("title") as string;
        const slug = formData.get("slug") as string;
        const excerpt = formData.get("excerpt") as string;
        const body_content = formData.get("body_content") as string;
        const category = formData.get("category") as string;
        const tags = formData.get("tags") as string;
        const read_time_minutes = parseInt(formData.get("read_time_minutes") as string) || 0;
        const focus_keyword = formData.get("focus_keyword") as string;
        const meta_title = formData.get("meta_title") as string;
        const schema_type = formData.get("schema_type") as string;
        const selected_tool = formData.get("selected_tool") as string;
        const tool_position = formData.get("tool_position") as string;
        const tool_markers_raw = formData.get("tool_markers") as string;
        const related_designs_raw = formData.get("related_designs") as string;
        const current_image_url = formData.get("current_image_url") as string;
        const file = formData.get("image") as File | null;

        if (!title || title.trim() === "") {
            throw new Error("Validation Error: Title is required.");
        }
        if (!slug || slug.trim() === "") {
            throw new Error("Validation Error: Slug is required.");
        }

        let finalImageUrl = current_image_url;

        if (file && file.size > 0) {
            const fileExt = file.name.split(".").pop();
            const fileName = `posts/${slug}-${Date.now()}.${fileExt}`;
            const fileBuffer = Buffer.from(await file.arrayBuffer());

            const { error: uploadError } = await supabaseAdmin.storage
                .from("tattoos")
                .upload(fileName, fileBuffer, {
                    contentType: file.type,
                    cacheControl: "3600",
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabaseAdmin.storage
                .from("tattoos")
                .getPublicUrl(fileName);
            
            finalImageUrl = publicUrl;
        }

        const { error } = await supabaseAdmin
            .from("posts")
            .update({
                title,
                slug,
                excerpt,
                body_content,
                category,
                tags,
                read_time_minutes,
                focus_keyword,
                meta_title,
                schema_type,
                selected_tool,
                tool_position,
                tool_markers: JSON.parse(tool_markers_raw || "[]"),
                related_designs: JSON.parse(related_designs_raw || "[]"),
                cover_image_url: finalImageUrl
            })
            .eq("id", id);

        if (error) throw error;

        revalidatePath("/admin/manage");
        revalidatePath("/blog");
        revalidatePath(`/blog/${slug}`);

        return { success: true };
    } catch (err: any) {
        console.error("[updatePostAction] Fatal Error:", err);
        return { success: false, error: err.message };
    }
}
 
export async function createPostAction() {
    try {
        await verifyAdminSession();

        const tempSlug = `draft-${Date.now()}`;
        const { data, error } = await supabaseAdmin
            .from("posts")
            .insert({
                title: "New Post Title",
                slug: tempSlug,
                excerpt: "Start with a short summary...",
                body_content: "Write your article here...",
                category: "Uncategorized",
                is_published: false,
                cover_image_url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop",
                cover_image_alt: "Article cover",
                author_id: "5ada0315-cde1-4bfd-98c6-e8161764e4cc",
                published_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;

        revalidatePath("/admin/manage");
        return { success: true, post: data };
    } catch (err: any) {
        console.error("[createPostAction] Fatal Error:", err);
        return { success: false, error: err.message };
    }
}

export async function uploadBlogImageAction(formData: FormData) {
    try {
        await verifyAdminSession();

        const file = formData.get("file") as File;
        const prefix = formData.get("prefix") as string || "inline";
        
        if (!file) throw new Error("No file provided");

        try {
            const { data: buckets } = await supabaseAdmin.storage.listBuckets();
            const exists = buckets?.some(b => b.name === "blog-images");
            if (!exists) {
                await supabaseAdmin.storage.createBucket("blog-images", { public: true });
            }
        } catch (bucketErr) {
            console.error("[uploadBlogImageAction] Bucket check/creation failed:", bucketErr);
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${prefix}-${Date.now()}.${fileExt}`;
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        const { error: uploadError } = await supabaseAdmin.storage
            .from("blog-images")
            .upload(fileName, fileBuffer, {
                contentType: file.type,
                cacheControl: "3600",
                upsert: true
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabaseAdmin.storage
            .from("blog-images")
            .getPublicUrl(fileName);
        
        return { success: true, url: publicUrl };
    } catch (err: any) {
        console.error("[uploadBlogImageAction] Error:", err);
        return { success: false, error: err.message };
    }
}

export async function uploadProductImageAction(formData: FormData) {
    try {
        await verifyAdminSession();

        const file = formData.get("file") as File;
        if (!file) throw new Error("No file provided");

        try {
            const { data: buckets } = await supabaseAdmin.storage.listBuckets();
            const exists = buckets?.some(b => b.name === "product-images");
            if (!exists) {
                await supabaseAdmin.storage.createBucket("product-images", { public: true });
            }
        } catch (bucketErr) {
            console.error("[uploadProductImageAction] Bucket check/creation failed:", bucketErr);
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        const { error: uploadError } = await supabaseAdmin.storage
            .from("product-images")
            .upload(fileName, fileBuffer, {
                contentType: file.type,
                cacheControl: "3600",
                upsert: true
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabaseAdmin.storage
            .from("product-images")
            .getPublicUrl(fileName);
        
        return { success: true, url: publicUrl };
    } catch (err: any) {
        console.error("[uploadProductImageAction] Error:", err);
        return { success: false, error: err.message };
    }
}

export async function getLabPostAction(id: string) {
    try {
        await verifyAdminSession();

        const { data, error } = await supabaseAdmin
            .from("posts")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;
        return { success: true, post: data };
    } catch (err: any) {
        console.error("[getLabPostAction] Error:", err);
        return { success: false, error: err.message };
    }
}

export async function updateLabPostAction(id: string, postData: LabPostPayload) {
    try {
        await verifyAdminSession();

        const { sync_products, ...dbPayload } = postData;

        if (!dbPayload.title || dbPayload.title.trim() === "") {
            throw new Error("Validation Error: Title is required.");
        }
        if (!dbPayload.slug || dbPayload.slug.trim() === "") {
            throw new Error("Validation Error: Slug is required.");
        }

        const { data, error } = await supabaseAdmin
            .from("posts")
            .update({
                ...dbPayload
            })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        if (sync_products !== false && postData.related_products && Array.isArray(postData.related_products)) {
            const postSlug = postData.slug;
            for (const product of postData.related_products) {
                try {
                    const productSlug = product.name
                        .toLowerCase()
                        .trim()
                        .replace(/[^a-z0-9\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .substring(0, 80);

                    await supabaseAdmin
                        .from('products')
                        .upsert({
                            name: product.name,
                            slug: productSlug,
                            price: product.price,
                            affiliate_url: product.affiliateUrl || product.url,
                            image_url: product.imageSrc || product.image_url || null,
                            button_label: product.buttonLabel || product.button_label || 'BUY NOW',
                            tag: product.badge || product.tag || null,
                            description: product.description || null,
                            category: postData.category || 'Uncategorized',
                            source_post_slug: postSlug,
                            updated_at: new Date().toISOString()
                        }, { onConflict: 'slug' });
                } catch (prodError) {
                    console.error("[updateLabPostAction] Product upsert failed:", prodError);
                }
            }
        }

        try {
            revalidatePath("/", "layout");
            revalidatePath("/admin/manage");
            revalidatePath("/blog");
            revalidatePath(`/blog/${postData.slug}`);
            revalidatePath('/products');
        } catch (e) {}

        return { success: true, post: data };
    } catch (err: any) {
        console.error("[updateLabPostAction] Error:", err);
        return { success: false, error: err.message };
    }
}

export async function publishLabPostAction(postData: LabPostPayload) {
    try {
        await verifyAdminSession();

        const { sync_products, ...dbPayload } = postData;

        // Input validation and null/empty checks
        if (!dbPayload.title || dbPayload.title.trim() === "") {
            throw new Error("Validation Error: Title is required.");
        }
        if (!dbPayload.slug || dbPayload.slug.trim() === "") {
            throw new Error("Validation Error: Slug is required.");
        }

        // Loop-based slug uniqueness verification checking
        const uniqueSlug = await ensureUniqueSlug("posts", dbPayload.slug);
        dbPayload.slug = uniqueSlug;

        if (!dbPayload.author_id) {
            dbPayload.author_id = "a1";
        }

        const { data, error } = await supabaseAdmin
            .from("posts")
            .insert({
                ...dbPayload,
                protocol_steps: dbPayload.protocol_steps || [],
                avoid_items: dbPayload.avoid_items || [],
                faq_items: dbPayload.faq_items || [],
                pull_quote: dbPayload.pull_quote || null,
                science_heading: dbPayload.science_heading || null,
                science_content: dbPayload.science_content || null,
                selected_tool: dbPayload.selected_tool || "NONE",
                tool_position: dbPayload.tool_position || null,
                tool_markers: dbPayload.tool_markers || [],
                visual_steps: dbPayload.visual_steps || [],
                post_template_type: dbPayload.post_template_type || 'STANDARD',
            })
            .select()
            .single();

        if (error) throw error;

        if (postData.sync_products !== false && postData.related_products && Array.isArray(postData.related_products)) {
            const postSlug = uniqueSlug;
            for (const product of postData.related_products) {
                try {
                    const productSlug = product.name
                        .toLowerCase()
                        .trim()
                        .replace(/[^a-z0-9\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .substring(0, 80);

                    await supabaseAdmin
                        .from('products')
                        .upsert({
                            name: product.name,
                            slug: productSlug,
                            price: product.price,
                            affiliate_url: product.affiliateUrl || product.url,
                            image_url: product.imageSrc || product.image_url || null,
                            button_label: product.buttonLabel || product.button_label || 'BUY NOW',
                            tag: product.badge || product.tag || null,
                            description: product.description || null,
                            category: postData.category || 'Uncategorized',
                            source_post_slug: postSlug,
                            updated_at: new Date().toISOString()
                        }, { onConflict: 'slug' });
                } catch (prodError) {
                    console.error("[publishLabPostAction] Product upsert failed for:", product.name, prodError);
                }
            }
            try {
                revalidatePath('/products');
            } catch (revalErr) {}
        }

        try {
            revalidatePath("/", "layout");
            revalidatePath("/admin/manage");
            revalidatePath("/blog");
            revalidatePath(`/blog/${uniqueSlug}`);
        } catch (revalErr) {}
        
        return { success: true, post: data };
    } catch (err: any) {
        console.error("[publishLabPostAction] Fatal Error:", err);
        return { success: false, error: err.message };
    }
}

export async function saveDraftAction(userId: string, draftData: Record<string, unknown>) {
    try {
        await verifyAdminSession();

        const { data, error } = await supabaseAdmin
            .from('admin_drafts')
            .upsert({
                user_id: userId,
                draft_data: draftData,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' })
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (err: any) {
        console.error("[saveDraftAction] Error:", err);
        return { success: false, error: err.message };
    }
}

export async function getDraftAction(userId: string) {
    try {
        await verifyAdminSession();

        const { data, error } = await supabaseAdmin
            .from('admin_drafts')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) throw error;
        return { success: true, data };
    } catch (err: any) {
        console.error("[getDraftAction] Error:", err);
        return { success: false, error: err.message };
    }
}

export async function deleteDraftAction(userId: string) {
    try {
        await verifyAdminSession();

        const { error } = await supabaseAdmin
            .from('admin_drafts')
            .delete()
            .eq('user_id', userId);

        if (error) throw error;
        return { success: true };
    } catch (err: any) {
        console.error("[deleteDraftAction] Error:", err);
        return { success: false, error: err.message };
    }
}

export async function createProductAction(productData: ProductPayload) {
    try {
        await verifyAdminSession();

        const { data, error } = await supabaseAdmin
            .from('products')
            .upsert({
                name: productData.name,
                slug: productData.slug,
                price: productData.price,
                affiliate_url: productData.affiliate_url,
                image_url: productData.image_url || null,
                button_label: productData.button_label || 'BUY NOW',
                tag: productData.tag || null,
                description: productData.description || null,
                category: productData.category || 'Uncategorized',
                source_post_slug: productData.source_post_slug || null,
                updated_at: new Date().toISOString()
            }, { onConflict: 'slug' })
            .select()
            .single();

        if (error) throw error;
        
        try {
            revalidatePath('/products');
            if (productData.category) {
                const catSlug = productData.category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                revalidatePath(`/products/${catSlug}`);
            }
        } catch (e) {}

        return { success: true, product: data };
    } catch (err: any) {
        console.error("[createProductAction] Error:", err);
        return { success: false, error: err.message };
    }
}

export async function deleteProductAction(productId: string) {
    try {
        await verifyAdminSession();

        const { error } = await supabaseAdmin
            .from('products')
            .delete()
            .eq('id', productId);

        if (error) throw error;
        
        try {
            revalidatePath('/products');
        } catch (e) {}

        return { success: true };
    } catch (err: any) {
        console.error("[deleteProductAction] Error:", err);
        return { success: false, error: err.message };
    }
}

export async function upsertArtistAction(formData: FormData) {
    try {
        await verifyAdminSession();

        const id = formData.get("id") as string | null;
        const full_name = formData.get("full_name") as string;
        const location = formData.get("location") as string;
        const specialty = formData.get("specialty") as string;
        const bio = formData.get("bio") as string;
        const link_url = formData.get("link_url") as string;
        const contact_email = formData.get("contact_email") as string || null;
        const contact_phone = formData.get("contact_phone") as string || null;

        const slug = full_name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-');

        let finalAvatarUrl = formData.get("existing_avatar_url") as string || "";
        const avatarFile = formData.get("avatar_file") as File | null;

        if (avatarFile && avatarFile.size > 0) {
            const fileName = `avatars/${slug}-${Date.now()}.webp`;
            const originalBuffer = Buffer.from(await avatarFile.arrayBuffer());

            const optimizedBuffer = await sharp(originalBuffer)
                .resize(400, 400, { fit: 'cover', position: 'center' })
                .webp({ quality: 80 })
                .toBuffer();

            const { error: uploadErr } = await supabaseAdmin.storage
                .from("artists")
                .upload(fileName, optimizedBuffer, {
                    contentType: "image/webp",
                    cacheControl: "31536000, immutable",
                    upsert: true
                });

            if (uploadErr) {
                console.error("[upsertArtistAction] Optimized Avatar Upload Fail:", uploadErr);
                throw uploadErr;
            }

            const { data: { publicUrl } } = supabaseAdmin.storage.from("artists").getPublicUrl(fileName);
            finalAvatarUrl = publicUrl;
        }

        const finalPortfolioImages: string[] = [];
        const portfolioCount = parseInt(formData.get("portfolio_count") as string) || 0;

        for (let i = 0; i < portfolioCount; i++) {
            const existingUrl = formData.get(`existing_portfolio_url_${i}`) as string;
            const portFile = formData.get(`portfolio_file_${i}`) as File | null;

            if (portFile && portFile.size > 0) {
                const fileName = `portfolios/${slug}-${i}-${Date.now()}.webp`;
                const originalBuffer = Buffer.from(await portFile.arrayBuffer());

                const optimizedBuffer = await sharp(originalBuffer)
                    .resize(1000, null, { withoutEnlargement: true, fit: 'inside' })
                    .webp({ quality: 82 })
                    .toBuffer();

                const { error: uploadErr } = await supabaseAdmin.storage
                    .from("artists")
                    .upload(fileName, optimizedBuffer, {
                        contentType: "image/webp",
                        cacheControl: "31536000, immutable",
                        upsert: true
                    });

                if (uploadErr) {
                    console.error(`[upsertArtistAction] Optimized Portfolio image ${i} upload fail:`, uploadErr);
                    throw uploadErr;
                }

                const { data: { publicUrl } } = supabaseAdmin.storage.from("artists").getPublicUrl(fileName);
                finalPortfolioImages.push(publicUrl);
            } else if (existingUrl && existingUrl.trim() !== "") {
                finalPortfolioImages.push(existingUrl);
            }
        }

        const isAdminUser = true; // Authorized via verifyAdminSession()

        const payload: any = {
            full_name,
            location,
            specialty,
            bio,
            link_url,
            avatar_url: finalAvatarUrl,
            portfolio_images: finalPortfolioImages,
            contact_email,
            contact_phone,
        };

        let error;
        if (id && id.trim() !== "" && !id.startsWith("mock-")) {
            if (isAdminUser) {
                payload.is_approved = true;
            }
            ({ error } = await supabaseAdmin
                .from('artists')
                .update(payload)
                .eq('id', id));
        } else {
            payload.is_approved = isAdminUser; 
            ({ error } = await supabaseAdmin
                .from('artists')
                .insert(payload));
        }

        if (error) throw error;

        revalidatePath('/artists');
        return { success: true };
    } catch (err: any) {
        console.error("[upsertArtistAction] Fatal Error:", err);
        return { success: false, error: err.message || "Internal server upload failure" };
    }
}

export async function approveArtistAction(artistId: string) {
    try {
        await verifyAdminSession();

        const { error } = await supabaseAdmin
            .from('artists')
            .update({ 
                is_approved: true,
                approved_at: new Date().toISOString()
            })
            .eq('id', artistId);

        if (error) throw error;

        revalidatePath('/artists');
        return { success: true };
    } catch (err: any) {
        console.error("[approveArtistAction] Error:", err);
        return { success: false, error: err.message };
    }
}

export async function deleteArtistAction(artistId: string) {
    try {
        await verifyAdminSession();

        const { error } = await supabaseAdmin
            .from('artists')
            .delete()
            .eq('id', artistId);

        if (error) throw error;

        revalidatePath('/artists');
        return { success: true };
    } catch (err: any) {
        console.error("[deleteArtistAction] Error:", err);
        return { success: false, error: err.message };
    }
}
