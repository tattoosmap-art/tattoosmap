import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import Papa from 'papaparse';
import { GoogleGenAI } from '@google/genai';

// Load Env
const envFile = fs.readFileSync('.env.local', 'utf8');
const key = envFile.match(/GEMINI_API_KEY=(.*)/);
if(key) process.env.GEMINI_API_KEY = key[1].trim();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const VISION_PROMPT = `Context: You are analyzing a black-ink, fine-line, minimalist tattoo design on a pure white background. Do not mistake the negative space for color. Do not describe the background.

Analyze the tattoo design image and return ONLY a valid JSON object with exactly these fields. Do NOT wrap it in markdown blockquotes like \`\`\`json. Return pure parseable JSON.

{
  "subject": string — the most specific possible subject description (e.g. "pluto disney dog sitting" not just "dog"),
  "style": string — always "fine-line" for this dataset but confirm if different,
  "mood": string — one of: minimalist, delicate, ornamental, illustrative, geometric,
  "public_category": string — must be exactly one of these five values: "nature-botanical" | "pop-culture-characters" | "animals-wildlife" | "celestial-mystical" | "minimalist-objects",
  "elements": array of strings — maximum 5 specific visual elements detected (e.g. ["sitting pose", "floppy ears", "collar", "disney style", "dotwork shading"]),
  "confidence": number — 0 to 1 representing how confident Gemini is in the subject identification,
  "alt_text": string — fully formed alt text description maximum 90 characters, no "image of" prefix, semantic and accessibility focused,
  "speakable_summary": string — a one sentence voice-search optimized description of the design for Speakable schema
}`;

const FAMILY_CODES = {
    'nature-botanical': 'nb', 'pop-culture-characters': 'pc',
    'animals-wildlife': 'aw', 'celestial-mystical': 'cm', 'minimalist-objects': 'mo'
};

async function runTest() {
    console.log("=== STARTING END-TO-END VALIDATION ===");
    const testFile = path.join(process.cwd(), 'test-design.png');
    const buffer = fs.readFileSync(testFile);
    
    // STEP 1: QUALITY GATE
    const originalFileSizeKb = +(buffer.length / 1024).toFixed(2);
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;
    const originalResolution = `${width}x${height}`;
    
    let qualityFlag = 'GOOD';
    let qualityNotes = '';

    if (width < 800 || height < 800) { qualityFlag = 'LOW_QUALITY'; qualityNotes = 'Source resolution too low — rescan required'; }
    const stats = await sharp(buffer).stats();
    const isBackgroundCluttered = stats.channels.some(c => c.mean < 235);
    if (isBackgroundCluttered && qualityFlag === 'GOOD') { qualityFlag = 'BACKGROUND_ISSUE'; qualityNotes = 'Cluttered or non-white background detected'; }
    if (originalFileSizeKb < 50 && qualityFlag === 'GOOD') { qualityFlag = 'VERIFY_SOURCE'; qualityNotes = 'Source file unusually small (<50KB). Verify before publishing.'; }

    console.log(`STEP 1: QUALITY GATE`);
    console.log(`Original Dimension: ${originalResolution}`);
    console.log(`Original Size: ${originalFileSizeKb} KB`);
    console.log(`Flag: ${qualityFlag}`);
    if(qualityFlag !== 'GOOD') { console.log(`Notes: ${qualityNotes}`); if(qualityFlag === 'LOW_QUALITY') return; }

    // STEP 2: IMAGE OPTIMIZATION
    let thumbBuffer = await sharp(buffer).resize({ width: 400, height: 400, fit: 'inside', withoutEnlargement: true }).sharpen({ sigma: 0.5 }).toColorspace('srgb').webp({ quality: 75 }).toBuffer();
    
    let currentQuality = 82;
    let fullBuffer;
    while (true) {
        fullBuffer = await sharp(buffer).resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true }).sharpen({ sigma: 0.5 }).toColorspace('srgb').webp({ quality: currentQuality }).toBuffer();
        if ((fullBuffer.length / 1024) <= 150 || currentQuality <= 60) break;
        currentQuality -= 5;
    }

    const fullWebpSizeKb = +(fullBuffer.length / 1024).toFixed(2);
    const thumbWebpSizeKb = +(thumbBuffer.length / 1024).toFixed(2);
    const fullMeta = await sharp(fullBuffer).metadata();
    const thumbMeta = await sharp(thumbBuffer).metadata();
    
    console.log(`\nSTEP 2: IMAGE OPTIMIZATION`);
    console.log(`Full Size: ${fullWebpSizeKb} KB (${fullMeta.width}x${fullMeta.height}) [Quality: ${currentQuality}]`);
    console.log(`Thumb Size: ${thumbWebpSizeKb} KB (${thumbMeta.width}x${thumbMeta.height})`);

    // Write physically to mimic route 
    const designsPath = path.join(process.cwd(), 'public', 'designs');
    const thumbsPath = path.join(designsPath, 'thumbs');
    if(!fs.existsSync(thumbsPath)) fs.mkdirSync(thumbsPath, {recursive: true});
    fs.writeFileSync(path.join(designsPath, 'test-output.webp'), fullBuffer);
    fs.writeFileSync(path.join(thumbsPath, 'test-thumb.webp'), thumbBuffer);
    console.log("Physically written successfully.");

    // STEP 3: GEMINI
    console.log(`\nSTEP 3: GEMINI VISION ANALYSIS`);
    const base64Str = thumbBuffer.toString('base64');
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [VISION_PROMPT, { inlineData: { data: base64Str, mimeType: 'image/webp' } }]
    });

    const textOutput = response.text || '';
    console.log(`RAW GEMINI RETURN:\n${textOutput}\n`);
    const cleanJSON = textOutput.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    const seoData = JSON.parse(cleanJSON);
    console.log(`PARSED SUBJECT: ${seoData.subject}`);
    console.log(`PARSED MOOD: ${seoData.mood}`);
    console.log(`PARSED PUBLIC_CATEGORY: ${seoData.public_category}`);
    console.log(`PARSED CONFIDENCE: ${seoData.confidence}`);
    
    const lowConfidence = (seoData.confidence || 0) < 0.55;
    const brandNames = ['disney', 'marvel', 'simpson', 'anime', 'ghibli', 'nintendo'];
    const ipFlag = brandNames.some(b => seoData.subject.toLowerCase().includes(b));
    console.log(`IP_FLAG: ${ipFlag}`);
    console.log(`LOW_CONFIDENCE: ${lowConfidence}`);

    // STEP 4: SEO Metadata
    function createSlug(subject) { return subject.toLowerCase().replace(/[^a-z0-z\s-]/g, '').trim().split(/\s+/).slice(0, 5).join('-'); }
    const subjectSlug = createSlug(seoData.subject || 'unknown');
    const mood = seoData.mood || 'minimalist';
    const code = FAMILY_CODES[seoData.public_category] || 'misc';
    const finalFilename = `fine-line-${subjectSlug}-${mood}-${code}.webp`;
    
    const altText = seoData.alt_text ? (seoData.alt_text.length > 125 ? seoData.alt_text.slice(0, 122).trim() + '...' : seoData.alt_text) : '';

    console.log(`\nSTEP 4: SEO METADATA GENERATION`);
    console.log(`SEO Filename: ${finalFilename}`);
    console.log(`Slug: ${subjectSlug}`);
    console.log(`Alt Text: ${altText}`);
    console.log(`Speakable Summary: ${seoData.speakable_summary}`);
    
    const visualWorkSchema = {
        "@context": "https://schema.org",
        "@type": "VisualArtwork",
        "name": `${seoData.subject} fine line tattoo design`,
        "description": altText,
        "image": `https://tattoosmap.com/designs/${finalFilename}`
    };

    // STEP 5: CSV OUTPUT
    const csvData = [{
        original_filename: 'test-design.png',
        original_resolution: originalResolution,
        original_file_size_kb: originalFileSizeKb,
        full_webp_size_kb: fullWebpSizeKb,
        thumb_webp_size_kb: thumbWebpSizeKb,
        quality_flag: qualityFlag,
        quality_notes: qualityNotes,
        seo_filename: finalFilename,
        thumbnail_filename: `fine-line-${subjectSlug}-${mood}-${code}-thumb.webp`,
        subject: seoData.subject,
        public_category: seoData.public_category,
        family_internal: 'unassigned',
        mood: seoData.mood,
        elements: seoData.elements ? seoData.elements.join(', ') : '',
        alt_text: altText,
        speakable_summary: seoData.speakable_summary,
        confidence_score: seoData.confidence,
        ip_flag: ipFlag ? 'TRUE' : 'FALSE',
        low_confidence_flag: lowConfidence ? 'TRUE' : 'FALSE',
        slug: subjectSlug,
        article_schema_ready: 'FALSE',
        visual_work_schema: JSON.stringify(visualWorkSchema),
        speakable_schema: JSON.stringify({}),
        status: ipFlag ? 'draft' : (lowConfidence ? 'review' : 'READY'),
        notes: ''
    }];

    console.log(`\n=== VISUAL SCHEMA ===\n${JSON.stringify(visualWorkSchema, null, 2)}`);
    console.log(`\n=== STEP 5: RAW CSV ===\n${Papa.unparse(csvData, { quotes: true })}\n`);
}

runTest().catch(console.error);
