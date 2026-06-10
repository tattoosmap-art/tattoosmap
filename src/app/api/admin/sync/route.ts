import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const action = url.searchParams.get("action");

        // Action: Final Revalidation
        if (action === "revalidate") {
            revalidatePath("/");
            revalidatePath("/designs", "page");
            revalidatePath("/designs/[slug]", "page");
            // Revalidate known categories
            const categories = ["nature-botanical", "pop-culture-characters", "animals-wildlife", "celestial-mystical", "minimalist-objects"];
            categories.forEach(c => revalidatePath(`/designs/categories/${c}`));
            
            return NextResponse.json({ success: true, message: "Revalidated globally." });
        }

        const { row } = await req.json();
        if (!row || !row.slug) {
            return NextResponse.json({ skipped: true, message: "Missing row data or slug (Likely a low_quality skipped row)" });
        }

        const statusStr = row.status?.toUpperCase() || "UNKNOWN";
        if (statusStr === "ERROR") {
            return NextResponse.json({ skipped: true, message: "Status is ERROR" });
        }

        let dbStatus = "draft";
        const ipFlag = row.ip_flag?.toUpperCase() === "TRUE";
        
        if (statusStr === "READY" && !ipFlag) {
            dbStatus = "published";
        } else if (statusStr === "REVIEW" || ipFlag) {
            dbStatus = "draft";
        }

        // 1. Upload File Atomically (if not a draft)
        const seoFilename = row.seo_filename;
        if (!seoFilename) throw new Error("No seo_filename found in row.");

        if (dbStatus !== "draft") {
            const filePath = path.join(process.cwd(), "public", "designs", seoFilename);
            let fileBuffer: Buffer;
            try {
                fileBuffer = await fs.readFile(filePath);
            } catch (err: any) {
                throw new Error(`Local file not found: ${seoFilename}`);
            }

            // Upload to Supabase Storage (Overwrite true by default to handle re-uploads smoothly)
            const { error: storageError } = await supabaseAdmin
                .storage
                .from("designs")
                .upload(seoFilename, fileBuffer, {
                    contentType: "image/webp",
                    upsert: true
                });

            if (storageError) {
                throw new Error(`Storage upload failed: ${storageError.message}`);
            }

            // We could also upload the thumbnail if it exists, let's try but make it non-fatal if missing, 
            // wait, we should make it fatal so the row isn't incomplete. The frontend CSV has thumbnail_filename.
            const thumbFilename = row.thumbnail_filename;
            if (thumbFilename) {
                try {
                    const thumbPath = path.join(process.cwd(), "public", "designs", "thumbs", thumbFilename);
                    const thumbBuffer = await fs.readFile(thumbPath);
                    
                    const { error: thumbError } = await supabaseAdmin
                        .storage
                        .from("designs")
                        .upload(`thumbs/${thumbFilename}`, thumbBuffer, {
                            contentType: "image/webp",
                            upsert: true
                        });
                    if (thumbError) throw new Error(`Thumbnail storage upload failed: ${thumbError.message}`);
                } catch (err: any) {
                    // If the thumbnail is missing locally or failed, we throw to abort the DB insert.
                    throw new Error(`Thumbnail issue: ${err.message}`);
                }
            }
        }


        // 2. Insert to Database via Upsert
        const supabaseDomain = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://smrnldmbvtflavzswghh.supabase.co";
        const dbRow = {
            slug: row.slug,
            title: row.subject || "Untitled Tattoo", // fallback to bypass NOT NULL title constraint if it exists
            seo_filename: row.seo_filename,
            image_url: row.seo_filename ? `${supabaseDomain}/storage/v1/object/public/designs/${row.seo_filename}` : "",
            thumbnail_url: row.thumbnail_filename ? `${supabaseDomain}/storage/v1/object/public/designs/thumbs/${row.thumbnail_filename}` : "",
            thumbnail_filename: row.thumbnail_filename || "",
            subject: row.subject || "",
            public_category: row.public_category || "minimalist-objects", // Fallback
            family_internal: row.family_internal || null,
            mood: row.mood || null,
            elements: row.elements ? row.elements.split(",").map((s: string) => s.trim()) : [],
            alt_text: row.alt_text || "",
            speakable_summary: row.speakable_summary || "",
            visual_work_schema: row.visual_work_schema ? JSON.parse(row.visual_work_schema) : null,
            speakable_schema: row.speakable_schema ? JSON.parse(row.speakable_schema) : null,
            confidence_score: row.confidence_score ? parseFloat(row.confidence_score) : null,
            ip_flag: ipFlag,
            status: dbStatus,
            // Smart Categorization Columns
            style: row.style ? row.style.split(",").map((s: string) => s.trim()) : ["Fine Line"],
            body_part: row.body_part ? row.body_part.split(",").map((s: string) => s.trim()) : ["Flash"],
            gender_suitability: row.gender_suitability || row.gender || "Unisex",
            
            // SEO Columns
            meta_title: row.meta_title || null,
            meta_description: row.meta_description || null,
            focus_keyword: row.focus_keyword || null,

            // Persona Enrichment Columns (Fixed Data Leakage)
            meaning: row.meaning || null,
            cultural_origin: row.cultural_origin || null,
            cultural_sensitivity: row.cultural_sensitivity || null,
            artist_technical_notes: row.artist_technical_notes || null,
            recommended_needle: row.recommended_needle || null,
            minimum_size_cm: row.minimum_size_cm ? parseFloat(row.minimum_size_cm) : null,
            placement_recommendations: row.placement_recommendations ? (typeof row.placement_recommendations === 'string' && row.placement_recommendations.startsWith('[') ? JSON.parse(row.placement_recommendations) : [row.placement_recommendations]) : [],
            aging_prediction: row.aging_prediction || null,
            pain_level_map: row.pain_level_map ? (typeof row.pain_level_map === 'string' && row.pain_level_map.startsWith('{') ? JSON.parse(row.pain_level_map) : row.pain_level_map) : null,
            style_tags: row.style_tags ? row.style_tags.split(",").map((s: string) => s.trim()) : [],
            emotion_tags: row.emotion_tags ? row.emotion_tags.split(",").map((s: string) => s.trim()) : [],
        };

        const { error: dbError } = await supabaseAdmin
            .from("designs")
            .upsert(dbRow, { onConflict: "slug" });

        if (dbError) {
            throw new Error(`Database upsert failed: ${dbError.message}`);
        }

        return NextResponse.json({ success: true, dbStatus });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
