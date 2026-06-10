"use server";

import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { encode } from "blurhash";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateMockupsForDesign } from "@/lib/mockup-generator";
import { verifyAdminSession } from "@/lib/admin-server";

export type PublishDesignPayload = {
    seo_filename: string;
    thumbnail_filename?: string;
    base64Image?: string; // Final processed image (Polished/Shaded)
    masterBase64?: string; // New: Original raw high-res upload for archiving
    subject: string;
    public_category: string;
    mood?: string;
    elements?: string;
    alt_text?: string;
    speakable_summary?: string;
    confidence_score?: number;
    ip_flag?: boolean;
    low_confidence_flag?: boolean;
    slug: string;
    visual_work_schema?: string;
    speakable_schema?: string;
    status?: string;
    
    // Persona Enrichment
    meaning?: string;
    cultural_origin?: string;
    cultural_sensitivity?: string | null;
    artist_technical_notes?: string;
    recommended_needle?: string;
    minimum_size_cm?: number;
    placement_recommendations?: string[] | string;
    aging_prediction?: string;
    pain_level_map?: any;
    style_tags?: string[] | string;
    emotion_tags?: string[] | string;
    gender_suitability?: string;

    // SEO fields
    meta_title?: string;
    meta_description?: string;
    focus_keyword?: string;

    // Generative Engine Optimization (SGE) Fields
    sge_snippet?: string;
    semantic_entities?: any[] | string;
    conversational_faqs?: any[] | string;

    // Image details
    image_width?: number;
    image_height?: number;
};

/**
 * Loop-based uniqueness verification for design slugs.
 * Checks against existing slugs and appends/regenerates a 4-character suffix up to 10 times in case of collision.
 */
async function ensureUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').substring(0, 80);
    if (!slug) {
        slug = "untitled-design";
    }
    
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
        const { data, error } = await supabaseAdmin
            .from("designs")
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
    
    throw new Error(`Failed to generate a unique slug for designs after ${maxAttempts} attempts.`);
}

export async function publishDesignAction(payload: PublishDesignPayload) {
    try {
        await verifyAdminSession();

        if (!payload.seo_filename) {
            throw new Error("Missing critical identifier data: seo_filename is required.");
        }
        if (!payload.subject || payload.subject.trim() === "") {
            throw new Error("Validation Error: Subject (title) is required.");
        }
        if (!payload.slug || payload.slug.trim() === "") {
            throw new Error("Validation Error: Slug is required.");
        }

        // Loop-based slug uniqueness verification
        const uniqueSlug = await ensureUniqueSlug(payload.slug);

        const supabaseDomain = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://smrnldmbvtflavzswghh.supabase.co";
        const isPublished = (payload.status === undefined || payload.status === "published" || payload.status === "READY" || payload.status === "LIVE");

        // 1. Get Image Buffer
        let fileBuffer: Buffer;
        if (payload.base64Image) {
            fileBuffer = Buffer.from(payload.base64Image, 'base64');
        } else {
            const rootPath = process.cwd();
            const filePath = path.join(rootPath, "public", "designs", payload.seo_filename);
            try {
                fileBuffer = await fs.readFile(filePath);
            } catch (err) {
                throw new Error(`Failed to access local ingestion file: ${payload.seo_filename}`);
            }
        }

        // 2. Upload Atomic Binary to Supabase Storage
        const { error: uploadError } = await supabaseAdmin.storage
            .from("designs")
            .upload(payload.seo_filename, fileBuffer, {
                contentType: "image/webp",
                cacheControl: "31536000, immutable",
                upsert: true
            });

        if (uploadError) throw new Error(`Storage primary upload failure: ${uploadError.message}`);

        // 3. Upload High-Res Master Copy (Private Archive)
        if (payload.masterBase64) {
            try {
                const masterBuffer = Buffer.from(payload.masterBase64, 'base64');
                const { error: masterError } = await supabaseAdmin.storage
                    .from("masters")
                    .upload(payload.seo_filename, masterBuffer, {
                        contentType: "image/webp",
                        upsert: true
                    });
                if (masterError) console.error("[publishDesignAction] Master archival failure:", masterError.message);
                else console.log("[publishDesignAction] Master archived successfully.");
            } catch (err) {
                console.error("[publishDesignAction] Master archival exception:", err);
            }
        }

        // 4. Generate and Upload Thumbnail
        if (payload.thumbnail_filename) {
            try {
                const thumbBuffer = await sharp(fileBuffer)
                    .resize({ width: 400, height: 400, fit: 'inside', withoutEnlargement: true })
                    .sharpen({ sigma: 0.5 })
                    .toColorspace('srgb')
                    .webp({ quality: 75 })
                    .toBuffer();
                
                const { error: thumbUploadError } = await supabaseAdmin.storage
                    .from("designs")
                    .upload(`thumbs/${payload.thumbnail_filename}`, thumbBuffer, {
                        contentType: "image/webp",
                        cacheControl: "31536000, immutable",
                        upsert: true
                    });
                if (thumbUploadError) console.error("[publishDesignAction] Non-fatal thumbnail upload failure:", thumbUploadError.message);
            } catch (err) {
                console.warn(`[publishDesignAction] Failed to generate or upload thumbnail: ${err}`);
            }
        }

        // 4. Generate Dynamic BlurHash from File Buffer
        let blurHashString = "L6PZfSi_.XxutRj[M_f6_3WBt7of"; // default fallback
        try {
            const rawForBlurhash = await sharp(fileBuffer)
                .resize(32, 32, { fit: 'inside' })
                .ensureAlpha()
                .raw()
                .toBuffer({ resolveWithObject: true });

            blurHashString = encode(
                new Uint8ClampedArray(rawForBlurhash.data),
                rawForBlurhash.info.width,
                rawForBlurhash.info.height,
                4, 4
            );
        } catch (blurErr) {
            console.error("[publishDesignAction] BlurHash generation error:", blurErr);
        }

        // 5. Measure Dimensions
        let imgWidth = payload.image_width || 1000;
        let imgHeight = payload.image_height || 1000;
        try {
            const metadata = await sharp(fileBuffer).metadata();
            imgWidth = metadata.width || imgWidth;
            imgHeight = metadata.height || imgHeight;
        } catch (_) {}

        const parseArrayInput = (input: string[] | string | undefined): string[] => {
            if (!input) return [];
            if (Array.isArray(input)) return input;
            if (typeof input === 'string') {
                if (input.startsWith('[')) {
                    try { return JSON.parse(input); } catch { return [input]; }
                }
                return input.split(",").map(t => t.trim());
            }
            return [];
        };

        // 6. Extract Array Formats Safely
        const elementsList = parseArrayInput(payload.elements);
        
        const styleTags = parseArrayInput(payload.style_tags);
        const emotionTags = parseArrayInput(payload.emotion_tags);
        const placementRecs = parseArrayInput(payload.placement_recommendations);

        // 7. Format Unified Database Record (Strict schema matching)
        const dbRow = {
            slug: uniqueSlug,
            title: payload.subject || "Untitled Tattoo Design",
            image_url: `${supabaseDomain}/storage/v1/object/public/designs/${payload.seo_filename}`,
            blurhash: blurHashString,
            seo_filename: payload.seo_filename,
            thumbnail_filename: payload.thumbnail_filename || null,
            alt_text: payload.alt_text || `A fine line tattoo design mapping ${payload.subject}`,
            
            // Taxonomy
            style: styleTags.length > 0 ? styleTags : ["Fine Line"],
            body_part: placementRecs.length > 0 ? placementRecs.map(p => p.split('(')[0].trim()) : ["Flash"],
            gender: (payload.gender_suitability === "Unisex" ? "Men and Women" : payload.gender_suitability) || "Men and Women",
            style_tags: styleTags,
            emotion_tags: emotionTags,

            // Gemini Persona Enrichment
            subject: payload.subject,
            public_category: payload.public_category || "minimalist-objects",
            mood: payload.mood || "minimalist",
            elements: elementsList,
            meaning: payload.meaning || null,
            cultural_origin: payload.cultural_origin || null,
            cultural_sensitivity: payload.cultural_sensitivity || null,
            artist_technical_notes: payload.artist_technical_notes || null,
            recommended_needle: payload.recommended_needle || null,
            minimum_size_cm: payload.minimum_size_cm || null,
            placement_recommendations: placementRecs,
            aging_prediction: payload.aging_prediction || null,
            pain_level_map: payload.pain_level_map || null,
            speakable_summary: payload.speakable_summary || null,

            // SEO Mapping
            meta_title: payload.meta_title || null,
            meta_description: payload.meta_description || null,
            focus_keyword: payload.focus_keyword || null,

            // Generative Engine Optimization (SGE) Mapping
            sge_snippet: payload.sge_snippet || null,
            semantic_entities: payload.semantic_entities ? (typeof payload.semantic_entities === 'string' ? payload.semantic_entities : JSON.stringify(payload.semantic_entities)) : '[]',
            conversational_faqs: payload.conversational_faqs ? (typeof payload.conversational_faqs === 'string' ? payload.conversational_faqs : JSON.stringify(payload.conversational_faqs)) : '[]',

            // State Management
            is_published: isPublished,
            confidence_score: payload.confidence_score || 0.8,
            ip_flag: !!payload.ip_flag,
            status: payload.status || "published"
        };

        // 8. DB Upsert execution with atomic atomic slug conflict safety
        const { data, error: dbError } = await supabaseAdmin
            .from("designs")
            .upsert(dbRow, { onConflict: "slug" })
            .select()
            .single();

        if (dbError) {
            throw new Error(`Atomic DB Ingestion failed: ${dbError.message}`);
        }

        // 9. Live Cache Busters (forces instantaneous gallery populating)
        try {
            revalidatePath("/gallery");
            revalidatePath(`/gallery/${data.id}`);
            revalidatePath("/", "layout");
        } catch (e) {
            console.warn("[publishDesignAction] Cache revalidation warning:", e);
        }

        // 10. Generate Realistic Skin Mockups (Non-blocking — best effort)
        try {
            const bestPlacement = placementRecs[0]?.split('(')[0]?.trim()?.toLowerCase() || 'forearm';
            console.log(`[publishDesignAction] Initiating direct high-fidelity mockup generation for ${uniqueSlug}...`);
            const { freshUrl, healedUrl } = await generateMockupsForDesign(dbRow.image_url, bestPlacement, uniqueSlug);
            
            if (freshUrl && healedUrl) {
                await supabaseAdmin
                    .from('designs')
                    .update({ image_fresh_url: freshUrl, image_healed_url: healedUrl })
                    .eq('slug', uniqueSlug);
                console.log(`[publishDesignAction] High-fidelity mockups generated and synced successfully for ${uniqueSlug}`);
            }
        } catch (mockupErr) {
            console.warn('[publishDesignAction] Mockup generation failed (non-fatal):', mockupErr);
        }

        return {
            success: true,
            designId: data.id,
            slug: data.slug,
            isPublished: data.is_published,
            message: data.is_published ? "Successfully Published Live!" : "Saved securely as Draft"
        };

    } catch (err: any) {
        console.error("[publishDesignAction] Execution Failure:", err);
        return {
            success: false,
            error: err.message || "Internal critical publication system error"
        };
    }
}
