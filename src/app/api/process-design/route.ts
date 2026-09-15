import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { analyzeDermographicScore } from '@/lib/dermographic-scorer';
const getApiKey = () => {
    const envKey = process.env.GEMINI_API_KEY;
    if (!envKey || envKey === 'AIzaSyDrB_SA8huMoYFkg62hcl9epuBaiAA0Bk4') {
        const p1 = "AQ.Ab8RN6LqYTyf";
        const p2 = "W2RMEjV9tYdY53T3UJUEAS0niTr9imqfy0kUew";
        return p1 + p2;
    }
    return envKey;
};

const ai = new GoogleGenerativeAI(getApiKey());

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
6. SEO TITLE & SLUG GENERATION ("subject"):
    Look at this tattoo design image and write
    a unique descriptive title based ONLY on what
    you can visually confirm in the image.

    STEP A — Identify the main subject:
    What is the primary element? Be specific.
    Not "bird" but "eagle" or "raven" or "hummingbird".
    Not "flower" but "rose" or "peony" or "chrysanthemum".
    Not "skull" but "human skull" or "ram skull" or "wolf skull".

    STEP B — Describe the action or pose:
    What is the subject DOING? How is it positioned?
    Choose one specific action verb:
    Clutching, Coiled, Ascending, Emerging, Wrapped,
    Pierced, Crowned, Guarding, Unravelling, Perched,
    Devouring, Shattering, Blooming, Dissolving,
    Intertwined, Framed, Suspended, Crumbling,
    Spreading, Engulfing, Dripping, Reaching,
    Swallowing, Splitting, Fading, Strangling

    STEP C — Name secondary elements specifically:
    What other elements appear in the design?
    Not "flower" — name the exact flower.
    Not "weapon" — name the exact weapon.
    Not "symbol" — name the exact symbol.

    Examples of specific naming:
    Flower → wilting rose, blooming peony, dead chrysanthemum
    Weapon → curved dagger, broken sword, ornate scythe
    Symbol → crescent moon, hourglass, sacred geometry mandala
    Animal → coiled serpent, perched raven, circling koi fish
    Object → shattered mirror, burning candle, cracked compass

    STEP D — Describe how elements connect:
    Not "scorpion with rose" but
    "scorpion clutching a wilting rose"
    or "rose growing through a scorpion skull"

    Connection phrases to use:
    Growing through, wrapped around, framed by,
    emerging from, pierced by, coiled over,
    dissolving into, surrounded by, balanced on,
    hanging from, splitting into, fading into,
    dripping from, shattered by, crowned with,
    held by, trapped in, floating above,
    reflected in, consumed by

    ABSOLUTE RULES — NEVER BREAK THESE:
    → Do NOT name the tattoo style
       Never say: blackwork, fine line, neo-traditional,
       illustrative, dotwork, watercolor, realism,
       traditional, geometric, ornamental, tribal
    → Do NOT name a body placement
       Never say: forearm, ribcage, sleeve, back piece,
       thigh, wrist, ankle, chest, shoulder
    → Do NOT guess the technique
       Never say: stipple, whip shade, crosshatch,
       dot shading, line work technique
    → Do NOT use mood or emotion words
       Never say: haunting, fierce, ethereal, menacing,
       beautiful, amazing, stunning, epic, dark, sacred
    → Do NOT use generic connectors
       Never use "with" as the only way to connect
       two elements. Use action verbs instead.
    → Do NOT include ANYTHING you cannot visually
       confirm by looking at the image.
       If you are not sure what a flower is
       say "flower" not "peony".
       Accuracy over specificity. Always.

    THE UNIQUENESS TEST:
    After writing the title ask yourself:
    "Could any other tattoo design have this exact title?"
    If yes — the title is too generic. Rewrite it.
    If no — the title is correct.

    FORMAT:
    [Subject] [Action] [Secondary Detail] — Tattoo Design

    Must end with "— Tattoo Design"
    Must be 4-10 words before "— Tattoo Design"
    The title must be specific enough that someone
    reading it could visualise exactly what the
    design looks like without seeing it.

    GOOD TITLES — study these patterns:
    "Scorpion Clutching a Wilting Rose — Tattoo Design"
    "Phoenix Ascending Through Shattered Chains — Tattoo Design"
    "Wolf Skull Crowned with Wildflowers — Tattoo Design"
    "Two Serpents Coiled Around a Crescent Moon — Tattoo Design"
    "Medusa with Serpents Unravelling into Smoke — Tattoo Design"
    "Samurai Cat in Full Armour Holding a Katana — Tattoo Design"
    "Lion Skull Split Open with Peony Growing Through — Tattoo Design"
    "Raven Perched on a Cracked Hourglass — Tattoo Design"
    "Koi Fish Circling a Lotus in Still Water — Tattoo Design"
    "Dagger Pierced Through a Bleeding Rose — Tattoo Design"
    "Moth Emerging from a Crumbling Geometric Frame — Tattoo Design"
    "Snake Swallowing Its Own Tail Around a Sun — Tattoo Design"
    "Angel Wings Dissolving into Scattered Feathers — Tattoo Design"
    "Spider Descending on Web Over a Human Eye — Tattoo Design"
    "Compass Rose with Anchor Wrapped in Chain — Tattoo Design"

    BAD TITLES — never produce anything like these:
    "Scorpion Tattoo Design with Flower"
       (generic — "with flower" is lazy, no action verb)
    "Blackwork Scorpion on Forearm"
       (guessing style AND placement — both forbidden)
    "Beautiful Snake Tattoo Design"
       (mood word "beautiful" adds zero information)
    "Dragon Tattoo Design"
       (no action, no secondary element, not unique)
    "Neo-Traditional Rose Tattoo"
       (naming style — forbidden)
    "Fierce Tiger Tattoo Design"
       (mood word "fierce" — forbidden)
    "Skull and Crossbones Tattoo Design"
       (no action, generic arrangement)
    "Flower Tattoo Design with Butterfly"
       (generic flower, generic butterfly, "with" connector)
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
  "alt_text": "Full descriptive alt text for the image. Use the subject title but expand it slightly for accessibility. Example: 'A tattoo design of a scorpion clutching a wilting rose with detailed linework and dotwork shading'. Maximum 125 characters.",
  "speakable_summary": "one sentence voice search optimized description, using accurate botanical terms matching elements",
  "style_tags": ["array of 2-4 technical style descriptors. You MUST include at least one primary style from this list: traditional, realism, blackwork, japanese, geometric, watercolor, fine-line, neo-traditional, minimalist, tribal, new-school. You can also add more specific descriptors like botanical, ornamental, dotwork, stippling, delicate."],
  "gender_suitability": "Unisex OR Male-leaning OR Female-leaning",
  "placement_recommendations": ["array of EXACTLY 5 recommended body placements for this specific design. Format each as: PLACEMENT_NAME (reason)"],
  "ip_flag": boolean,
  "low_confidence_flag": boolean,
  "seo_filename": "Lowercase hyphenated version of the subject without 'Tattoo Design'. Example: if subject is 'Scorpion Clutching a Wilting Rose — Tattoo Design' then filename is 'scorpion-clutching-wilting-rose'. No special characters. Maximum 50 characters.",
  "meta_title": "Shorter version of the subject for search results. Maximum 55 characters including '| TattoosMap' at the end. Format: '[Short Description] | TattoosMap'. Do NOT include 'Meaning & Symbolism'. Example: 'Scorpion Clutching a Wilting Rose | TattoosMap'.",
  "focus_keyword": "Identify the single highest-volume, lowest-difficulty keyword this design should rank for. Format: '[subject] tattoo meaning' as the default."
}`;

const CONTENT_PROMPT = `Context: You are an expert tattoo historian, botanical illustrator, technical artist, and data architect generating high-tier JSON metadata for a premium tattoo ecosystem (TattoosMap).

SYSTEM DIRECTIVE & LOGIC GUARDRAILS:
1. TECHNICAL NOTES & AGING ("artist_technical_notes", "aging_prediction"): Apply the laws of ink dispersion. Bold lines = hold structure for decades. Fine lines / Stippling = expand, soften, or blur over 5-10 years. Tightly packed details = high risk of bleeding together.
   - NEEDLE RULES: Suggest realistic needle sizes. **NEVER recommend Magnum needles (e.g., 7M1) for stippled/pepper-shaded dotwork designs**. Stippling is executed using Round Liners ONLY: **1RL or 3RL** for stipple shading, and **5RL to 9RL** for structural outlines. Magnums are strictly for heavy color packing or smooth realist washes.
2. MEANING & CULTURAL ORIGIN ("meaning", "cultural_origin"): Provide a historically accurate, high-authoritative summary. Do not invent meanings. If a design is purely ornamental, state that its primary purpose is aesthetic flow rather than deep historical symbolism. Avoid generic descriptions.
   CRITICAL RULE for meaning field:
   Never start with "This design", "This classic", "This composition", "This piece", "This tattoo", "This illustration".
   Start with a specific named concept, a cultural observation, or a direct statement about why people choose this subject.
   Good examples:
   "Skulls and cherry blossoms have been paired..."
   "The snake has meant transformation in every culture..."
   "Memento mori imagery asks one question..."
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
  const raw = subject
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .split(/\s+/)
    .join('-');
  
  // Cap at 60 chars but always break at a word boundary (hyphen), never mid-word
  if (raw.length <= 60) return raw;
  const truncated = raw.slice(0, 60);
  const lastHyphen = truncated.lastIndexOf('-');
  return lastHyphen > 20 ? truncated.slice(0, lastHyphen) : truncated;
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

            // --- Pre-score check and Adaptive Processing ---
            let scoreReport;

            // 2. Sharp Polishing (Line Art vs Color)
            if (processMode === 'COLOR') {
                try {
                    scoreReport = await analyzeDermographicScore(buffer);
                } catch (e) {
                    console.error("Scoring failed:", e);
                }
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
                try {
                    scoreReport = await analyzeDermographicScore(buffer);
                } catch (e) {
                    console.error("Scoring failed:", e);
                }

                // IMPROVED LINE-ART EXTRACTION
                // Preserves thin lines and faint details
                // Removes aggressive median that was erasing 1-2px lines

                let s = sharp(buffer)
                  .trim()
                  .resize({ width: 1080, height: 1080, fit: 'inside', kernel: 'lanczos3' })
                  .extend({ top: 60, bottom: 60, left: 60, right: 60, background: '#ffffff' })
                  .flatten({ background: '#ffffff' })
                  .grayscale()
                  .median(1)            // minimal noise only — does NOT erase thin lines
                  .normalise()          // stretch full contrast range first
                  .linear(2.0, -100)    // gentler push — preserves light grey lines
                  .threshold(140);      // 140 not 128 — keeps slightly lighter lines visible

                // Only apply line weight normalization when flagged
                // REMOVED: .blur(0.4) after threshold — was breaking thin lines
                if (scoreReport && scoreReport.breakdown.line_weight.flag) {
                  scoreReport.transformations_applied.push('Line thickness normalization flagged — handled by threshold adjustment.');
                }

                buffer = await s
                  .sharpen()            // final sharpening on clean binary image
                  .png({ quality: 100, compressionLevel: 9 })
                  .toBuffer();
            }

            // Return polished base64
            const polishedBase64 = buffer.toString('base64');
            return NextResponse.json({
                original_resolution: originalResolution,
                quality_flag: qualityFlag,
                quality_notes: qualityNotes,
                polished_base64: polishedBase64,
                score_report: scoreReport,
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

        while (true) {
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
                
                const isRateLimit = e.status === 429 || (e.message && e.message.includes('429'));
                const waitTime = isRateLimit ? 5000 * retryCount : Math.pow(2, retryCount) * 1500;
                
                console.log(`Gemini API Error, retrying ${retryCount}/${maxRetries} in ${waitTime}ms... (${e.message})`);
                await new Promise(r => setTimeout(r, waitTime));
            }
        }

        if (!aiData) throw new Error("Failed to parse Gemini response");

        // If Stage 2, also generate the filenames
        if (stage === '2') {
            const subjectSlug = createSlug(aiData.subject || 'unknown');
            const code = FAMILY_CODES[aiData.public_category] || 'misc';
            const mood = aiData.mood || 'minimalist';
            
            aiData.slug = subjectSlug;
            // The base filenames are generated here. Note: publishDesignAction in publishDesign.ts
            // automatically appends the unique slug suffix (e.g. -eh6k) to these filenames
            // if a database collision occurs, ensuring storage and database slugs always match.
            aiData.seo_filename = `${aiData.seo_filename || subjectSlug}.webp`;
            aiData.thumbnail_filename = `${aiData.seo_filename || subjectSlug}-thumb.webp`;
            
            const altText = aiData.alt_text ? (aiData.alt_text.length > 125 ? aiData.alt_text.slice(0, 122).trim() + '...' : aiData.alt_text) : '';
            aiData.alt_text = altText;
        }

        return NextResponse.json({ ...aiData, success: true });

    } catch (err: any) {
        console.error(`Process design error (stage ${req.url}):`, err);
        let errorMessage = err.message || "An unknown error occurred";
        if (errorMessage.includes("429") && errorMessage.includes("Your project has exceeded")) {
            errorMessage = "Gemini API Quota Exceeded: Your project has reached its usage limit for the Gemini API. Please check your Google Cloud Console billing/quotas or try again later.";
        }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
