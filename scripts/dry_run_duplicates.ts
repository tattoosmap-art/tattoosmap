import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash', generationConfig: { responseMimeType: "application/json" } });

const duplicateSlugs = [
  'blackwork-ascending-phoenix-with-stippled-wings-and-stars', 'fine-line-ascending-phoenix-linework-tattoo-design', 'illustrative-ascending-phoenix-and-woman-blackwork-tattoo',
  'illustrative-stippled-ascending-woman-with-phoenix-tattoo', 'illustrative-blackwork-celestial-phoenix-maiden-with', 'traditional-blackwork-spider-with-geometric-abdomen-tattoo',
  'blackwork-mystical-scorpio-with-stippled-moon-phases-tattoo', 'illustrative-mystical-linework-scorpio-scorpion-tattoo', 'blackwork-coiled-scorpion-with-stippled-blossom-tattoo',
  'blackwork-coiled-scorpion-with-stippled-rose-tattoo-design', 'illustrative-mystical-scorpion-with-blooming-rose-tattoo', 'traditional-mystical-eye-spider-with-hanging-web-tattoo-design',
  'traditional-haunting-skull-spider-linework-on-cobweb-tattoo', 'blackwork-haunting-skull-spider-with-stippled-webbing', 'neo-traditional-stippled-deer-skull-dagger-tattoo-design',
  'traditional-symmetrical-whip-shaded-moth-tattoo-design', 'traditional-stippled-dagger-piercing-blooming-rose-tattoo', 'traditional-soaring-eagle-with-stippled-feathers-tattoo',
  'blackwork-stippled-scorpion-with-delicate-hearts-tattoo', 'blackwork-ascending-phoenix-with-celestial-moon-and-tree', 'illustrative-ascending-phoenix-with-stippled-lotus-tattoo',
  'blackwork-ascending-phoenix-with-stippled-wings-tattoo', 'illustrative-soaring-phoenix-with-blooming-lily-and', 'ascending-phoenix-and-stippled-lotus-tattoo-design',
  'medusa-tattoo-design-vo5k', 'medusa-tattoo-design', 'medusa-tattoo-design-cokx', 'medusa-tattoo-design-cvky', 'medusa-tattoo-design-59n4',
  'butterfly-tattoo-design', 'butterfly-tattoo-design-eh6k', 'butterfly-tattoo-design-cpli', 'butterfly-tattoo-design-2st2',
  'floral-dragon-tattoo-design', 'dragon-tattoo-design', 'dragon-tattoo-design-j22d',
  'lotus-tattoo-design-kk2d', 'lotus-tattoo-design-ae48', 'lotus-tattoo-design',
  'lotus-moon-tattoo-design-t6cq', 'lotus-moon-tattoo-design', 'lotus-moon-tattoo-design-85no',
  'semicolon-tattoo-design-cq1t', 'semicolon-tattoo-design',
  'illustrative-falling-icarus-with-stippled-lightning-tattoo-design', 'illustrative-falling-icarus-with-stippled-feathered-wings-tattoo-design',
  'illustrative-blooming-sunflower-lily-and-butterfly-tattoo-design', 'illustrative-blooming-sunflower-and-stippled-butterflies-tattoo-design',
  'cherry-blossom-tattoo-design-d4fj', 'cherry-blossom-tattoo-design',
  'feather-tattoo-design', 'feather-tattoo-design-ngci',
  'neo-traditional-lighthouse-tattoo-design', 'neo-traditional-lighthouse-tattoo-design-1yj3',
  'lion-crown-tattoo-design', 'lion-crown-tattoo-design-va9p'
];

const TAXONOMY_PROMPT = `
You are an expert tattoo taxonomist and SEO specialist. Analyze this tattoo design image and provide detailed, accurate metadata in a strict JSON format.

1. SUBJECT IDENTIFICATION: Identify the primary subject of the tattoo with botanical/anatomical accuracy. 
2. STYLE CLASSIFICATION: Classify the tattoo into EXACTLY ONE primary style.
3. MOOD/VIBE: Identify the primary mood.
4. PUBLIC CATEGORY: Map the design to one of our five top-level categories.
5. VISUAL ELEMENTS: List up to 5 specific visual elements.

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

7. CATEGORIZATION GUARDRAILS ("public_category"): Do NOT use "pop-culture-characters" for generic historical figures.

JSON STRUCTURE:
{
  "subject": "most specific possible subject description ending with 'Tattoo Design'",
  "style": "The exact primary style.",
  "mood": "one of: minimalist, delicate, ornamental, illustrative, geometric",
  "public_category": "exactly one of these five values: nature-botanical | pop-culture-characters | animals-wildlife | celestial-mystical | minimalist-objects",
  "elements": ["array of max 5 specific, botanically accurate visual elements"],
  "confidence": 95,
  "alt_text": "Full descriptive alt text for the image. Use the subject title but expand it slightly for accessibility. Example: 'A tattoo design of a scorpion clutching a wilting rose with detailed linework and dotwork shading'. Maximum 125 characters.",
  "speakable_summary": "one sentence voice search optimized description",
  "style_tags": ["array of 2-4 technical style descriptors."],
  "gender_suitability": "Unisex OR Male-leaning OR Female-leaning",
  "placement_recommendations": ["array of EXACTLY 5 recommended body placements"],
  "ip_flag": false,
  "low_confidence_flag": false,
  "seo_filename": "Lowercase hyphenated version of the subject without 'Tattoo Design'. Example: if subject is 'Scorpion Clutching a Wilting Rose — Tattoo Design' then filename is 'scorpion-clutching-wilting-rose'. No special characters. Maximum 50 characters.",
  "meta_title": "Shorter version of the subject for search results. Maximum 55 characters including '| TattoosMap' at the end. Format: '[Short Description] | TattoosMap'. Do NOT include 'Meaning & Symbolism'.",
  "focus_keyword": "Identify the single highest-volume, lowest-difficulty keyword"
}
`;

async function getImpressions() {
  const impressions = new Map<string, number>();
  try {
    const csv = fs.readFileSync('scratch_gsc/Pages.csv', 'utf-8');
    const lines = csv.split('\n');
    for (const line of lines) {
      if (line.includes('https://tattoosmap.com/gallery/')) {
        const parts = line.split(',');
        const url = parts[0];
        const imps = parseInt(parts[2], 10) || 0;
        const slugMatch = url.match(/gallery\/(.+)$/);
        if (slugMatch) {
          impressions.set(slugMatch[1], imps);
        }
      }
    }
  } catch (e) {
    console.error("Could not load GSC data", e);
  }
  return impressions;
}

async function fetchImageBuffer(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function run() {
  const impressionsMap = await getImpressions();
  
  let processed = 0;
  for (const slug of duplicateSlugs) {
    // if (processed >= 5) break;

    const imps = impressionsMap.get(slug) || 0;
    if (imps > 50) {
      console.log(`\n[SKIP] ${slug} has ${imps} impressions (>50)`);
      continue;
    }

    const { data, error } = await supabase.from('designs').select('*').eq('slug', slug).single();
    if (error || !data) {
      console.log(`\n[ERROR] Could not find ${slug}`);
      continue;
    }

    console.log(`\n-----------------------------------`);
    console.log(`PROCESSING: ${slug} (Impressions: ${imps})`);
    console.log(`BEFORE subject: ${data.subject}`);
    console.log(`BEFORE meta_title: ${data.meta_title}`);

    try {
      const imgBuffer = await fetchImageBuffer(data.image_url);
      const imagePart = {
        inlineData: {
          data: imgBuffer.toString("base64"),
          mimeType: "image/jpeg"
        },
      };

      const result = await model.generateContent([TAXONOMY_PROMPT, imagePart]);
      const response = await result.response;
      let text = response.text();
      text = text.replace(/```json\n/g, '').replace(/```/g, '').trim();
      const aiData = JSON.parse(text);

      console.log(`AFTER subject: ${aiData.subject}`);
      console.log(`AFTER meta_title: ${aiData.meta_title}`);
      console.log(`AFTER seo_filename: ${aiData.seo_filename}`);
      
      const { error: updateError } = await supabase
        .from('designs')
        .update({
          subject: aiData.subject,
          meta_title: aiData.meta_title,
          seo_filename: aiData.seo_filename,
          alt_text: aiData.alt_text
        })
        .eq('slug', slug);

      if (updateError) {
        console.error(`[DB ERROR] Failed to update ${slug}: `, updateError);
      } else {
        console.log(`[SUCCESS] Updated ${slug} in database.`);
        processed++;
      }
    } catch (e: any) {
      console.error(`Failed to process Gemini for ${slug}: `, e.message);
    }
  }
}

run();
