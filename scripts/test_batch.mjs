import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import Papa from 'papaparse';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';

// Parse .env.local manually
const envPath = path.resolve('.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length > 0) env[key.trim()] = values.join('=').trim();
});
process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;

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
  "alt_text": string — a fully formed alt text description maximum 125 characters, no "image of" prefix, semantic and accessibility focused,
  "speakable_summary": string — a one sentence voice-search optimized description of the design for Speakable schema
}`;

function createSlug(subject) {
    return subject.toLowerCase().replace(/[^a-z0-z\s-]/g, '').trim().split(/\s+/).slice(0, 5).join('-');
}
const FAMILY_CODES = {
    'nature-botanical': 'nb', 'pop-culture-characters': 'pc',
    'animals-wildlife': 'aw', 'celestial-mystical': 'cm', 'minimalist-objects': 'mo'
};

async function testBatch() {
    const desktopPath = '/Users/killywilly/Desktop/Fine line tattoo designs';
    const files = fs.readdirSync(desktopPath).filter(f => f.endsWith('.png')).slice(0, 5);
    
    console.log(`Testing 5 files from Desktop (Rate Limit Cap)...`);
    const results = [];
    const previousFilenames = [];
    
    try {
        for (const fileName of files) {
            console.log(`Processing: ${fileName}`);
            const buffer = fs.readFileSync(path.join(desktopPath, fileName));
            
            // WebP Conversion (Check 4)
            const fullBuffer = await sharp(buffer).resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
            const thumbBuffer = await sharp(buffer).resize({ width: 400, height: 400, fit: 'inside' }).webp({ quality: 80 }).toBuffer();
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [VISION_PROMPT, { inlineData: { data: thumbBuffer.toString('base64'), mimeType: 'image/webp' } }]
            });
            
            const cleanJSON = response.text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            const seoData = JSON.parse(cleanJSON);
        
        const lowConfidence = (seoData.confidence || 0) < 0.55;
        const brandNames = ['disney', 'marvel', 'simpson', 'anime', 'ghibli', 'nintendo'];
        const ipFlag = brandNames.some(b => seoData.subject.toLowerCase().includes(b));
        
        const subjectSlug = createSlug(seoData.subject || 'unknown-tattoo');
        const code = FAMILY_CODES[seoData.public_category] || 'misc';
        let finalFilename = `fine-line-${subjectSlug}-${seoData.mood || 'minimalist'}-${code}.webp`;
        
        results.push({
            original_filename: fileName,
            seo_filename: finalFilename,
            subject: seoData.subject,
            public_category: seoData.public_category,
            confidence: seoData.confidence,
            full_size_kb: (fullBuffer.length / 1024).toFixed(2),
            thumb_size_kb: (thumbBuffer.length / 1024).toFixed(2),
            ip_flag: ipFlag,
            visual_work_schema: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "VisualArtwork",
                "name": `${seoData.subject} fine line tattoo design`,
                "description": seoData.alt_text,
                "image": `https://tattoosmap.com/designs/${finalFilename}`
            })
        });
    }
    } catch (e) { console.error("Quota hit, saving what we have...", e.message); }
    
    const csvString = Papa.unparse(results, { quotes: true });
    fs.writeFileSync('test_10_batch.csv', csvString);
    console.log("CSV Generated: test_10_batch.csv");
    
    // Output checks
    console.log("\n--- TEST RESULTS ---");
    console.log("1. Check 4 (Sizes): ", results.map(r => `${r.full_size_kb}KB / ${r.thumb_size_kb}KB`).join(', '));
    console.log("2. Check 3 (Confidence Scores): ", results.map(r => r.confidence));
    console.log("3. Check 2 (Filenames): ");
    results.forEach(r => console.log(`   ${r.seo_filename}`));
    console.log("4. Check 5 (JSON-LD sample):");
    console.log(results[0].visual_work_schema);
}

testBatch().catch(console.error);
