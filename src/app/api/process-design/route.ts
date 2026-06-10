import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const TAXONOMY_PROMPT = `Context: You are an expert tattoo historian, botanical illustrator, technical artist, and data architect generating high-tier JSON metadata for a premium tattoo ecosystem (TattoosMap).

SYSTEM DIRECTIVE & LOGIC GUARDRAILS:
1. LOGIC & CROSS-REFERENCING (The "Deity Rule"): Before generating placements, determine if the subject is a religious or sacred figure (e.g., Hindu gods, Buddhist icons, Jesus). IF YES: You are strictly forbidden from suggesting lower body placements (legs, calves, thighs, feet). All placements must be upper body (back, chest, arms, shoulders). IF NO: Proceed with standard anatomical mapping based on the design's physical shape.
2. THE BOTANICAL ACCURACY RULE (Elements): Do not default to generic floral terms like "rose" or "lily" unless those distinctive traits are unmistakably present. Carefully analyze the artwork:
   - Prominent central stamens/pistils (stalks with dots) -> Tag as **Cherry Blossom / Sakura, Plum Blossom, or Hibiscus**.
   - Dense, heavily layered, ruffled petals -> Tag as **Peony or Chrysanthemum**.
   - Ensure the "elements", "meaning", and "speakable_summary" all use identical, accurate botanical names.
3. BODY PLACEMENT ("body_part" & "placement_recommendations"): Evaluate Shape. Vertical/Tall -> Forearm, Calf, Shin, Tricep. Symmetrical/Oval -> Sternum, Upper Back, Thigh. Wide/Sprawling -> Chest, Full Back, Torso. Provide EXACTLY 5 placements. Each recommendation must include a brief, physically logical justification inside parentheses (e.g., "FOREARM (Vertical orientation fits the natural shape of the arm)"). Obey the Deity Rule.
4. GENDER ("gender_suitability"): Default to "Men and Women". Only use "Female-leaning" or "Male-leaning" if the composition relies heavily on hyper-traditional gendered design tropes.
5. STYLE & TAXONOMY: 
   - Thick outer lines + solid color/whip shading = Traditional / Neo-traditional.
   - No outlines + smooth gradients = Realism / Black & Grey.
   - Strictly black ink + stippling/dotwork = Blackwork / Illustrative.
   - Single needle precision + vast negative space = Fine Line.
   - Fine dots or peppered shading = Stippled / Whip-shaded Blackwork.
6. SEO TITLE & SLUG GENERATION ("subject"): The "subject" MUST end with the explicit user intent modifier "Tattoo Design" (e.g., "Samurai Warrior Tattoo Design").
7. CATEGORIZATION GUARDRAILS ("public_category"): Do NOT use "pop-culture-characters" for generic historical figures, mythological creatures, or generic archetypes (e.g., Samurai, Knights, Dragons). Reserve "pop-culture-characters" strictly for licensed intellectual property (e.g., Batman, anime characters). If the design represents a historic, celestial, or mythological theme, classify it as "celestial-mystical" or "nature-botanical" accordingly.

CRITICAL: Do NOT truncate the output. You MUST complete the entire JSON object through to the final closing brace, including all keys. Incomplete responses are unacceptable.

Analyze the image and return ONLY a valid JSON object. Do NOT wrap it in markdown blockquotes like \`\`\`json.
{
  "subject": "most specific possible subject description ending with 'Tattoo Design'",
  "style": "The exact primary style. DO NOT default to fine-line. Apply the classification rules strictly.",
  "mood": "one of: minimalist, delicate, ornamental, illustrative, geometric",
  "public_category": "exactly one of these five values: nature-botanical | pop-culture-characters | animals-wildlife | celestial-mystical | minimalist-objects",
  "elements": ["array of max 5 specific, botanically accurate visual elements"],
  "confidence": number,
  "alt_text": "125 char max, no image of prefix",
  "speakable_summary": "one sentence voice search optimized description, using accurate botanical terms matching elements",
  "style_tags": ["array of 2-4 technical style descriptors. You MUST include at least one primary style from this list: traditional, realism, blackwork, japanese, geometric, watercolor, fine-line, neo-traditional, minimalist, tribal, new-school. You can also add more specific descriptors like botanical, ornamental, dotwork, stippling, delicate."],
  "gender_suitability": "Unisex OR Male-leaning OR Female-leaning",
  "placement_recommendations": ["array of EXACTLY 5 recommended body placements for this specific design. Format each as: PLACEMENT_NAME (reason)"],
  "ip_flag": boolean,
  "low_confidence_flag": boolean,
  "meta_title": "Generate an SEO-optimized page title for this design following this exact format: '[Subject] — Meaning & Symbolism | TattoosMap'. Maximum 60 characters. Note: the '[Subject]' should be the generated subject ending with Tattoo Design.",
  "focus_keyword": "Identify the single highest-volume, lowest-difficulty keyword this design should rank for. Format: '[subject] tattoo meaning' as the default."
}`;

const CONTENT_PROMPT = `Context: You are an expert tattoo historian, botanical illustrator, technical artist, and data architect generating high-tier JSON metadata for a premium tattoo ecosystem (TattoosMap).

SYSTEM DIRECTIVE & LOGIC GUARDRAILS:
1. TECHNICAL NOTES & AGING ("artist_technical_notes", "aging_prediction"): Apply the laws of ink dispersion. Bold lines = hold structure for decades. Fine lines / Stippling = expand, soften, or blur over 5-10 years. Tightly packed details = high risk of bleeding together.
   - NEEDLE RULES: Suggest realistic needle sizes. **NEVER recommend Magnum needles (e.g., 7M1) for stippled/pepper-shaded dotwork designs**. Stippling is executed using Round Liners ONLY: **1RL or 3RL** for stipple shading, and **5RL to 9RL** for structural outlines. Magnums are strictly for heavy color packing or smooth realist washes.
2. MEANING & CULTURAL ORIGIN ("meaning", "cultural_origin"): Provide a historically accurate, high-authoritative summary. Do not invent meanings. If a design is purely ornamental, state that its primary purpose is aesthetic flow rather than deep historical symbolism. Avoid generic descriptions.
3. THE BOTANICAL ACCURACY RULE (Meaning): Ensure that if the design contains flowers, you cross-reference with the botanical elements identified in Stage 1 and use identical, accurate botanical names (e.g., Peony, Sakura, Chrysanthemum) in your meaning explanation.
4. GENERATIVE ENGINE OPTIMIZATION (SGE / AI Overviews):
   - "sge_snippet": A definitive, punchy, 35-45 word summary explaining the exact meaning of the design. Start with direct definitions. Avoid fluff.
   - "semantic_entities": Map the specific visual symbols in the tattoo directly to their symbolic meanings, facilitating machine readability. Format exactly as: [{"symbol": "symbol name", "meaning": "symbolic meaning"}]
   - "conversational_faqs": Provide exactly 2 highly relevant follow-up questions a user would ask an AI assistant about this specific tattoo's meaning, along with direct, authoritative answers. Format exactly as: [{"question": "FAQ question?", "answer": "FAQ answer."}]

CRITICAL: Do NOT truncate the output. You MUST complete the entire JSON object through to the final closing brace, including all SGE fields (sge_snippet, semantic_entities, conversational_faqs). Incomplete responses are unacceptable.

Analyze the image and return ONLY a valid JSON object. Do NOT wrap it in markdown blockquotes like \`\`\`json.
{
  "meaning": "2-4 sentences explaining what this design symbolizes. Be specific to the exact subject. Example for snake and flower: explain the duality of danger and beauty, transformation through shedding, the tension between mortality and renewal. Never be generic.",
  "cultural_origin": "one sentence stating the cultural or historical tradition this design draws from. Example: Japanese Irezumi, Victorian memento mori, Norse mythology, American Traditional. If purely decorative state that clearly.",
  "cultural_sensitivity": "null if no sensitivity concerns. If the design incorporates Indigenous, Polynesian, Maori, First Nations, or other closed cultural practices write one sentence explaining the cultural context.",
  "emotion_tags": ["array of 2-4 emotion or meaning keywords that describe what this design represents. Examples: transformation, resilience, freedom, grief, love, power, protection."],
  "minimum_size_cm": number,
  "recommended_needle": "specific needle recommendation for this design type (e.g. 3RL, 5RL, 7M1)",
  "aging_prediction": "2-3 sentences describing how this specific design type ages over 5-10 years. Be honest and specific.",
  "pain_level_map": {
    "forearm_outer": "low/medium/high", "forearm_inner": "low/medium/high", "upper_arm": "low/medium/high", "shoulder": "low/medium/high",
    "shoulder_blade": "low/medium/high", "chest": "low/medium/high", "ribs": "low/medium/high", "stomach": "low/medium/high",
    "wrist": "low/medium/high", "ankle": "low/medium/high", "foot": "low/medium/high", "behind_ear": "low/medium/high",
    "neck": "low/medium/high", "thigh": "low/medium/high", "calf": "low/medium/high"
  },
  "artist_technical_notes": "2-3 sentences of specific technical guidance for the tattooing artist.",
  "sge_snippet": "punchy 35-45 word definition-first summary of the tattoo meaning",
  "semantic_entities": [
    {
      "symbol": "Visual Symbol (e.g., Monarch Butterfly)",
      "meaning": "Symbolic Meaning (e.g., Transformation and spiritual rebirth)"
    }
  ],
  "conversational_faqs": [
    {
      "question": "Conversational Question 1?",
      "answer": "Direct, authoritative answer 1."
    },
    {
      "question": "Conversational Question 2?",
      "answer": "Direct, authoritative answer 2."
    }
  ]
}`;

function createSlug(subject: string) {
    return subject.toLowerCase().replace(/[^a-z0-z\s-]/g, '').trim().split(/\s+/).slice(0, 5).join('-');
}

const FAMILY_CODES: Record<string, string> = {
    'nature-botanical': 'nb', 'pop-culture-characters': 'pc',
    'animals-wildlife': 'aw', 'celestial-mystical': 'cm', 'minimalist-objects': 'mo'
};

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const stage = formData.get('stage') as string || '1';
        
        // --- STAGE 1: QUALITY & SHARP POLISH ---
        if (stage === '1') {
            const file = formData.get('file') as File;
            if (!file) return NextResponse.json({ error: 'No image uploaded' }, { status: 400 });
            
            const processMode = formData.get('processMode') as string || 'LINE_ART';
            let buffer: any = Buffer.from(new Uint8Array(await file.arrayBuffer()));

            // 1. Quality Gate
            const originalFileSizeKb = +(buffer.length / 1024).toFixed(2);
            const metadata = await sharp(buffer).metadata();
            const width = metadata.width || 0;
            const height = metadata.height || 0;
            const originalResolution = `${width}x${height}`;
            
            let qualityFlag = 'GOOD';
            let qualityNotes = '';

            if (width < 800 || height < 800) {
                qualityFlag = 'UPSCALED';
                qualityNotes = 'Source resolution was low. Upscaled automatically.';
            }

            // 2. Sharp Polishing (Line Art vs Color)
            if (processMode === 'COLOR') {
                buffer = await sharp(buffer)
                    .trim() // Auto-crop scanner/paper borders
                    .resize({ width: 1080, height: 1080, fit: 'inside', kernel: 'lanczos3' })
                    .extend({ top: 60, bottom: 60, left: 60, right: 60, background: '#ffffff' })
                    .flatten({ background: '#ffffff' })
                    .modulate({ saturation: 1.15, brightness: 1.05 })
                    .linear(1.05, -5)
                    .sharpen()
                    .webp({ quality: 85 })
                    .toBuffer();
            } else {
                buffer = await sharp(buffer)
                    .trim() // Auto-crop scanner/paper borders
                    .resize({ width: 1080, height: 1080, fit: 'inside', kernel: 'lanczos3' })
                    .extend({ top: 60, bottom: 60, left: 60, right: 60, background: '#ffffff' })
                    .flatten({ background: '#ffffff' })
                    .median(3) // Wipes out dust, hair, speckles, and small stains next to the design
                    .blur(0.4) // Smooth the edges for clean vectors
                    .linear(2, -120) // High contrast shift to bleach paper smudges
                    .threshold(160) // Keep only pure dark ink lines, erase shadows
                    .sharpen() // Lock in crisp, vector-like line borders
                    .webp({ quality: 85 })
                    .toBuffer();
            }

            // Return polished base64
            const polishedBase64 = buffer.toString('base64');
            return NextResponse.json({
                original_resolution: originalResolution,
                quality_flag: qualityFlag,
                quality_notes: qualityNotes,
                polished_base64: polishedBase64,
                success: true
            });
        }

        // --- STAGE 2 & 3: GEMINI API ---
        const base64Image = formData.get('base64Image') as string;
        if (!base64Image) return NextResponse.json({ error: 'No base64 image provided for AI analysis' }, { status: 400 });

        const promptToUse = stage === '2' ? TAXONOMY_PROMPT : CONTENT_PROMPT;
        
        let aiData;
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
            try {
                const model = ai.getGenerativeModel({ model: 'gemini-flash-latest' });
                const response = await model.generateContent([
                    promptToUse,
                    { inlineData: { data: base64Image, mimeType: 'image/webp' } }
                ]);

                const cleanJSON = response.response.text().replace(/^```json\s*/, '').replace(/\s*```$/, '');
                aiData = JSON.parse(cleanJSON);
                break;
            } catch (e: any) {
                retryCount++;
                if (retryCount >= maxRetries) throw e;
                console.log(`Gemini API Error, retrying ${retryCount}/${maxRetries}...`);
                await new Promise(r => setTimeout(r, 2000));
            }
        }

        if (!aiData) throw new Error("Failed to parse Gemini response");

        // If Stage 2, also generate the filenames
        if (stage === '2') {
            const subjectSlug = createSlug(aiData.subject || 'unknown');
            const code = FAMILY_CODES[aiData.public_category] || 'misc';
            const mood = aiData.mood || 'minimalist';
            
            aiData.slug = subjectSlug;
            aiData.seo_filename = `fine-line-${subjectSlug}-${mood}-${code}.webp`;
            aiData.thumbnail_filename = `fine-line-${subjectSlug}-${mood}-${code}-thumb.webp`;
            
            const altText = aiData.alt_text ? (aiData.alt_text.length > 125 ? aiData.alt_text.slice(0, 122).trim() + '...' : aiData.alt_text) : '';
            aiData.alt_text = altText;
        }

        return NextResponse.json({ ...aiData, success: true });

    } catch (err: any) {
        console.error(`Process design error (stage ${req.url}):`, err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
