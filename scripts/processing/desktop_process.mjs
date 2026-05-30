import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DESKTOP_FOLDER = path.join(process.env.HOME, 'Desktop', 'new tattoo');
const DESIGNS_DIR = path.join(PROJECT_ROOT, 'public', 'designs');
const THUMBS_DIR = path.join(DESIGNS_DIR, 'thumbs');
const CSV_PATH = path.join(PROJECT_ROOT, 'tattoosmap_seo_data_2026-03-30.csv');

// --- MANUAL AI LOOKUP TABLE (Simulating Gemini) ---
const MANUAL_METADATA = {
    "fine-line-floral-composition-f2-000.png": {
        "subject": "fine line wildflower and rose bud botanical study",
        "style": "fine-line",
        "mood": "delicate",
        "public_category": "nature-botanical",
        "elements": ["wildflower", "rose bud", "botanical branch", "line art", "minimalist"],
        "confidence": 0.98,
        "alt_text": "Elegant fine line wildflower and rose bud botanical tattoo design on white background.",
        "speakable_summary": "An elegant fine-line botanical composition featuring a fully bloomed wildflower and a delicate rose bud."
    },
    "fine-line-minimalist-buds-f1-004.png": {
        "subject": "fine line floral crescent moon celestial design",
        "style": "fine-line",
        "mood": "delicate",
        "public_category": "celestial-mystical",
        "elements": ["crescent moon", "blooming flower", "sparkles", "twinkling stars", "botanical leaves"],
        "confidence": 0.95,
        "alt_text": "Celestial fine line floral tattoo with crescent moon, leaves, and shimmering stars.",
        "speakable_summary": "A stunning celestial composition blending a blooming wildflower with a delicate crescent moon and magical sparkles."
    },
    "fine-line-minimalist-buds-f1-005.png": {
        "subject": "minimalist fine line long-stem rose flower",
        "style": "fine-line",
        "mood": "delicate",
        "public_category": "nature-botanical",
        "elements": ["long-stem rose", "blooming petals", "thorns", "botanical leaves", "outline art"],
        "confidence": 0.99,
        "alt_text": "Classic fine line long-stem rose tattoo design with leaves on single stem.",
        "speakable_summary": "A timeless and elegant single long-stem rose rendered in minimalist fine-line ink."
    },
    "fine-line-minimalist-buds-f1-028.png": {
        "subject": "illustrative fine line breaching whale and moon",
        "style": "fine-line",
        "mood": "illustrative",
        "public_category": "animals-wildlife",
        "elements": ["breaching whale", "ocean waves", "crescent moon", "sparkling stars", "cartoon style"],
        "confidence": 0.92,
        "alt_text": "Charming fine line tattoo of a breaching whale jumping under a crescent moon.",
        "speakable_summary": "A whimsical illustrative tattoo design featuring a joyful whale breaching the ocean surface under a moonlit sky."
    }
};

const FAMILY_CODES = {
    'nature-botanical': 'nb', 'pop-culture-characters': 'pc',
    'animals-wildlife': 'aw', 'celestial-mystical': 'cm', 'minimalist-objects': 'mo'
};

function createSlug(subject) {
    return subject.toLowerCase().replace(/[^a-z0-z\s-]/g, '').trim().split(/\s+/).slice(0, 5).join('-');
}

async function processFile(filePath) {
    const fileName = path.basename(filePath);
    console.log(`\n--- Processing: ${fileName} ---`);

    const seoData = MANUAL_METADATA[fileName];
    if (!seoData) {
        console.error(`Skipping ${fileName}: No manual metadata found.`);
        return null;
    }

    let buffer = await fs.readFile(filePath);
    const originalMetadata = await sharp(buffer).metadata();
    const originalSizeKb = (buffer.length / 1024).toFixed(2);

    // 1. PERFECT POLISH (LINE ART)
    console.log("Applying Polish (Line Art)...");
    buffer = await sharp(buffer)
        .resize({ width: 1000, height: 1000, fit: 'inside', kernel: 'lanczos3' })
        .resize({ width: 1200, height: 1200, fit: 'contain', background: '#ffffff' })
        .flatten({ background: '#ffffff' })
        .blur(0.6)
        .linear(2, -150)
        .threshold(180)
        .sharpen()
        .toBuffer();

    // 2. THUMBNAIL
    const thumbBuffer = await sharp(buffer)
        .resize({ width: 400, height: 400, fit: 'inside' })
        .sharpen({ sigma: 0.5 })
        .webp({ quality: 75 })
        .toBuffer();

    // 3. COMPRESSION LOOP (150KB Limit)
    let quality = 82;
    let fullBuffer;
    while (true) {
        fullBuffer = await sharp(buffer)
            .webp({ quality })
            .toBuffer();
        if (fullBuffer.length / 1024 <= 150 || quality <= 60) break;
        quality -= 5;
    }

    // 4. FILE NAMING & SAVING
    console.log("Simulating AI Data Injection...");
    const subjectSlug = createSlug(seoData.subject);
    const mood = seoData.mood;
    const code = FAMILY_CODES[seoData.public_category] || 'misc';
    const baseName = `fine-line-${subjectSlug}-${mood}-${code}`;
    const seoFilename = `${baseName}.webp`;
    const thumbFilename = `${baseName}-thumb.webp`;

    await fs.mkdir(THUMBS_DIR, { recursive: true });
    await fs.writeFile(path.join(DESIGNS_DIR, seoFilename), fullBuffer);
    await fs.writeFile(path.join(THUMBS_DIR, thumbFilename), thumbBuffer);
    console.log(`Saved: ${seoFilename}`);

    const ipFlag = ['disney', 'marvel', 'simpson', 'anime', 'ghibli', 'nintendo'].some(b => seoData.subject.toLowerCase().includes(b));
    const lowConfidence = (seoData.confidence || 0) < 0.55;
    
    return {
        original_filename: fileName,
        original_resolution: `${originalMetadata.width}x${originalMetadata.height}`,
        original_file_size_kb: originalSizeKb,
        full_webp_size_kb: (fullBuffer.length / 1024).toFixed(2),
        thumb_webp_size_kb: (thumbBuffer.length / 1024).toFixed(2),
        quality_flag: 'GOOD',
        quality_notes: 'Restoration applied successfully',
        seo_filename: seoFilename,
        thumbnail_filename: thumbFilename,
        subject: seoData.subject,
        public_category: seoData.public_category,
        family_internal: 'unassigned',
        mood: seoData.mood,
        elements: (seoData.elements || []).join(', '),
        alt_text: seoData.alt_text,
        speakable_summary: seoData.speakable_summary,
        confidence_score: seoData.confidence,
        ip_flag: ipFlag ? 'TRUE' : 'FALSE',
        low_confidence_flag: lowConfidence ? 'TRUE' : 'FALSE',
        slug: subjectSlug,
        article_schema_ready: 'FALSE',
        visual_work_schema: JSON.stringify({ "@context": "https://schema.org", "@type": "VisualArtwork", "name": seoData.subject, "description": seoData.alt_text }),
        speakable_schema: JSON.stringify({ "@context": "https://schema.org", "@type": "SpeakableSpecification", "cssSelector": [".speakable"] }),
        status: 'READY',
        notes: 'AI Simulation Mode'
    };
}

async function run() {
    try {
        const files = (await fs.readdir(DESKTOP_FOLDER)).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));
        console.log(`Found ${files.length} files to process in Manual AI Mode.`);

        const results = [];
        for (const file of files) {
            const data = await processFile(path.join(DESKTOP_FOLDER, file));
            if (data) results.push(data);
        }

        if (results.length === 0) {
            console.log("No files were successfully processed.");
            return;
        }

        // APPEND TO CSV
        console.log("\nUpdating CSV...");
        let csvContent = "";
        try {
            csvContent = await fs.readFile(CSV_PATH, 'utf8');
        } catch (e) {
            csvContent = '"original_filename","original_resolution","original_file_size_kb","full_webp_size_kb","thumb_webp_size_kb","quality_flag","quality_notes","seo_filename","thumbnail_filename","subject","public_category","family_internal","mood","elements","alt_text","speakable_summary","confidence_score","ip_flag","low_confidence_flag","slug","article_schema_ready","visual_work_schema","speakable_schema","status","notes"\n';
        }

        for (const r of results) {
            const line = `"${r.original_filename}","${r.original_resolution}","${r.original_file_size_kb}","${r.full_webp_size_kb}","${r.thumb_webp_size_kb}","${r.quality_flag}","${r.quality_notes}","${r.seo_filename}","${r.thumbnail_filename}","${r.subject}","${r.public_category}","${r.family_internal}","${r.mood}","${r.elements}","${r.alt_text}","${r.speakable_summary}","${r.confidence_score}","${r.ip_flag}","${r.low_confidence_flag}","${r.slug}","${r.article_schema_ready}",'${r.visual_work_schema}','${r.speakable_schema}',"${r.status}","${r.notes}"\n`;
            csvContent += line;
        }

        await fs.writeFile(CSV_PATH, csvContent);
        console.log(`\nSuccessfully processed ${results.length} designs in Manual AI Mode!`);
        console.log(`Final polished designs saved in public/designs/`);
        console.log(`CSV updated: ${CSV_PATH}`);

    } catch (error) {
        console.error("Error during processing:", error);
    }
}

run();
