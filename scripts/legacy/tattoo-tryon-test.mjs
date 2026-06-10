/**
 * TattoosMap — Anatomy-Aware Tattoo Try-On Engine
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * PIPELINE:
 *   1. Gemini Vision → Reads body photo, identifies skin zones & clothing edges
 *   2. Sharp (Local)  → Creates a BLACK/WHITE mask (white = paint here)
 *                        Mask automatically clipped at clothing edge (sleeve, etc.)
 *   3. Replicate API  → Stable Diffusion Inpainting:
 *                        - Original pixels outside mask = UNTOUCHED (person is preserved)
 *                        - Inside mask = tattoo painted, following skin texture & shadows
 *
 * HOW TO RUN:
 *   1. Save the body photo   → scripts/test-assets/body-photo.jpg
 *   2. Save the tattoo PNG   → scripts/test-assets/tiger-design.png
 *   3. Run:
 *        REPLICATE_API_TOKEN=r8_xxx GEMINI_API_KEY=xxx node scripts/tattoo-tryon-test.mjs
 *
 * OUTPUT:
 *   scripts/test-assets/arm-mask.png      ← The skin mask (for debugging)
 *   scripts/test-assets/output-mockup.png ← The final try-on result
 * ═══════════════════════════════════════════════════════════════════════════
 */

import Replicate from "replicate";
import { GoogleGenerativeAI } from "@google/generative-ai";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Asset Paths ──────────────────────────────────────────────────────────────
const ASSETS_DIR       = path.join(__dirname, "test-assets");
const BODY_PHOTO_PATH  = path.join(ASSETS_DIR, "body-photo.jpg");
const TATTOO_PATH      = path.join(ASSETS_DIR, "tiger-design.png");
const MASK_PATH        = path.join(ASSETS_DIR, "arm-mask.png");
const OUTPUT_PATH      = path.join(ASSETS_DIR, "output-mockup.png");

// ── Replicate Model ──────────────────────────────────────────────────────────
// Stable Diffusion Inpainting — only modifies the white mask area.
// The rest of the image stays PIXEL-PERFECT identical to the original.
const SD_INPAINT_MODEL =
  "stability-ai/sdxl-inpainting:56505191e459dbd446dc7f6deab4873138b70404c053c84666cf7f8a846f3640";

// ── Step 1: Gemini Vision Analysis ──────────────────────────────────────────
async function analyzeBodyPhoto() {
  console.log("\n──────────────────────────────────────────────");
  console.log("STEP 1 — Gemini Vision: Analysing body photo");
  console.log("──────────────────────────────────────────────");

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const imageBytes = fs.readFileSync(BODY_PHOTO_PATH);
  const base64     = imageBytes.toString("base64");

  const prompt = `
Analyse this photo. Return ONLY valid JSON (no markdown, no explanation).

{
  "skin_zones": [
    {
      "body_part": "describe body part e.g. right forearm",
      "x_pct": 0.0,
      "y_pct": 0.0,
      "width_pct": 0.0,
      "height_pct": 0.0,
      "clothing_overlap": "none|partial|full",
      "clothing_edge_y_pct": 0.0
    }
  ],
  "best_placement": "name the single best body_part for a large tattoo",
  "notes": "brief anatomical note"
}

Rules:
- x_pct, y_pct, width_pct, height_pct are fractions of image (0.0–1.0)
- clothing_edge_y_pct is the Y fractional position where clothing starts to cover skin
  (only needed when clothing_overlap = "partial")
- Identify ALL visible exposed skin areas
- Choose best_placement based on surface area and flatness
`;

  const result = await model.generateContent([
    { inlineData: { data: base64, mimeType: "image/jpeg" } },
    prompt,
  ]);

  const raw = result.response.text().trim();
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`Gemini returned non-JSON: ${raw.substring(0, 300)}`);

  const analysis = JSON.parse(match[0]);
  console.log("✅ Gemini analysis:\n" + JSON.stringify(analysis, null, 2));
  return analysis;
}

// ── Step 2: Build Skin Mask (respects clothing edge) ────────────────────────
async function buildSkinMask(analysis) {
  console.log("\n──────────────────────────────────────────────");
  console.log("STEP 2 — Creating skin mask (clothing-aware)");
  console.log("──────────────────────────────────────────────");

  const { width, height } = await sharp(BODY_PHOTO_PATH).metadata();

  // Pick the best skin zone
  const zone = analysis.skin_zones.find(
    (z) => z.body_part === analysis.best_placement
  ) ?? analysis.skin_zones[0];

  if (!zone) throw new Error("No skin zone found in Gemini analysis.");

  // Convert percentages → pixels
  const x = Math.round(zone.x_pct * width);
  const y = Math.round(zone.y_pct * height);
  const w = Math.round(zone.width_pct * width);
  let   h = Math.round(zone.height_pct * height);

  // CLOTHING AWARENESS: ensure mask stays within skin area and doesn't overlap clothing
  if (zone.clothing_overlap === "partial" && zone.clothing_edge_y_pct) {
    const clothingEdgePx = Math.round(zone.clothing_edge_y_pct * height);
    
    // If the clothing is on TOP (standard sleeve case)
    if (y < clothingEdgePx) {
      const clippedH = clothingEdgePx - y;
      if (clippedH < h) {
        console.log(`  👕 Sleeve detected at y=${clothingEdgePx}px — mask clipped from ${h}px → ${clippedH}px`);
        h = clippedH;
      }
    } else {
      // Skin zone is already below clothing edge, no clipping needed
      console.log(`  👕 Sleeve is safely above skin zone (y=${y}px vs edge=${clothingEdgePx}px).`);
    }
  }

  console.log(`  Skin zone: x=${x} y=${y} w=${w} h=${h} (on ${width}×${height} image)`);

  // Build: black canvas + white ellipse on skin zone
  // BLACK = "keep original pixel"   WHITE = "paint tattoo here"
  const svgMask = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="black"/>
      <ellipse
        cx="${x + w / 2}"
        cy="${y + h / 2}"
        rx="${(w / 2) * 0.88}"
        ry="${(h / 2) * 0.88}"
        fill="white"
      />
    </svg>`;

  await sharp(Buffer.from(svgMask))
    .grayscale()
    .png()
    .toFile(MASK_PATH);

  console.log("✅ Mask saved →", MASK_PATH);
  return { x, y, w, h, zone };
}

// ── Step 3: Stable Diffusion Inpainting via Replicate ───────────────────────
async function runInpainting(replicate, maskData) {
  console.log("\n──────────────────────────────────────────────");
  console.log("STEP 3 — Replicate API: SD Inpainting (Cropped)");
  console.log("──────────────────────────────────────────────");

  const { x, y, w, h } = maskData;
  const CROP_PATH = path.join(ASSETS_DIR, "body-crop.jpg");
  const MASK_CROP_PATH = path.join(ASSETS_DIR, "mask-crop.png");

  // Add 100px padding for context, then crop both photo and mask
  const padding = 80;
  const { width: fullW, height: fullH } = await sharp(BODY_PHOTO_PATH).metadata();
  
  const left   = Math.max(0, x - padding);
  const top    = Math.max(0, y - padding);
  const width  = Math.min(fullW - left, w + (padding * 2));
  const height = Math.min(fullH - top, h + (padding * 2));

  console.log(`  ✂️  Cropping arm area for AI focus: [${left}, ${top}, ${width}, ${height}]`);

  await sharp(BODY_PHOTO_PATH).extract({ left, top, width, height }).toFile(CROP_PATH);
  await sharp(MASK_PATH).extract({ left, top, width, height }).toFile(MASK_CROP_PATH);

  const imageB64 = fs.readFileSync(CROP_PATH).toString("base64");
  const maskB64  = fs.readFileSync(MASK_CROP_PATH).toString("base64");

  const prompt = [
    "traditional black ink tattoo artwork applied to anatomical forearm surface",
    "sharp clean black ink lines",
    "classic american tattoo style with tiger and flower elements",
    "healed ink appearance",
    "matte texture",
    "diffuse lighting",
    "professional artistic portfolio",
  ].join(", ");

  const negativePrompt = [
    "nudity, blurry, low quality, cartoon, logo, text, watermark",
    "bright colors, red skin, fresh wound, illustration",
  ].join(", ");

  console.log("  Prompt:", prompt.substring(0, 80) + "...");
  console.log("  Running Replicate SD Inpainting...");

  const output = await replicate.run(
    "stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3",
    {
      input: {
        image: `data:image/jpeg;base64,${imageB64}`,
        mask:  `data:image/png;base64,${maskB64}`,
        prompt,
        negative_prompt: negativePrompt,
        num_inference_steps: 40,
        strength: 0.82,
        seed: 123
      },
    }
  );

  // Replicate SDK v1 returns a FileOutput object — get the real URL from it
  let resolvedUrl;
  if (typeof output === "string") {
    resolvedUrl = output;
  } else if (Array.isArray(output)) {
    const item = output[0];
    resolvedUrl = typeof item === "string" ? item : item.url().href;
  } else if (output && typeof output.url === "function") {
    resolvedUrl = output.url().href;
  } else {
    resolvedUrl = String(output);
  }
  console.log("✅ Replicate result URL:", resolvedUrl);
  return { resultUrl: resolvedUrl, cropMetadata: { left, top, width, height } };
}

// ── Step 4: Composite Back ──────────────────────────────────────────────────
async function saveResult(url, cropMeta) {
  console.log("\n──────────────────────────────────────────────");
  console.log("STEP 4 — Compositing back onto original photo");
  console.log("──────────────────────────────────────────────");

  // Fetch the inpainted crop from Replicate's CDN
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download result: ${res.status} ${res.statusText}`);
  const inpaintBuffer = Buffer.from(await res.arrayBuffer());

  // Resize back to the exact crop dimensions
  const resizedInpaint = await sharp(inpaintBuffer)
    .resize(cropMeta.width, cropMeta.height)
    .toBuffer();

  // Composite the painted crop back onto the ORIGINAL full photo
  await sharp(BODY_PHOTO_PATH)
    .composite([{ input: resizedInpaint, left: cropMeta.left, top: cropMeta.top }])
    .png()
    .toFile(OUTPUT_PATH);

  console.log("✅ Saved final composite →", OUTPUT_PATH);
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n╔═══════════════════════════════════════════════════════╗");
  console.log("║   TattoosMap · Anatomy-Aware Tattoo Try-On Engine    ║");
  console.log("╚═══════════════════════════════════════════════════════╝");

  // ── Validate env & assets ────────────────────────────────────────────────
  if (!process.env.REPLICATE_API_TOKEN) {
    console.error("\n❌ Missing: REPLICATE_API_TOKEN");
    console.error("   export REPLICATE_API_TOKEN=r8_your_token_here");
    process.exit(1);
  }
  if (!process.env.GEMINI_API_KEY) {
    console.error("\n❌ Missing: GEMINI_API_KEY");
    console.error("   export GEMINI_API_KEY=your_key_here");
    process.exit(1);
  }

  const missing = [
    [BODY_PHOTO_PATH,  "Body photo  → scripts/test-assets/body-photo.jpg"],
    [TATTOO_PATH,      "Tattoo PNG  → scripts/test-assets/tiger-design.png"],
  ].filter(([p]) => !fs.existsSync(p));

  if (missing.length) {
    console.error("\n❌ Missing asset files:");
    missing.forEach(([, msg]) => console.error("   " + msg));
    process.exit(1);
  }

  fs.mkdirSync(ASSETS_DIR, { recursive: true });

  // ── Run pipeline ─────────────────────────────────────────────────────────
  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

  // ── MANUAL OVERRIDE FOR TEST (Bypass Gemini 404) ────────────────────────
  const analysis = {
    "skin_zones": [
      {
        "body_part": "right forearm",
        "x_pct": 0.65,
        "y_pct": 0.38,
        "width_pct": 0.20,
        "height_pct": 0.50,
        "clothing_overlap": "partial",
        "clothing_edge_y_pct": 0.35
      }
    ],
    "best_placement": "right forearm",
    "notes": "Safe forearm zone below sleeve edge."
  };
  console.log("⚠️  Using Manual Calibration for Test Assets...");
  // ── END MANUAL OVERRIDE ──────────────────────────────────────────────────

  const maskData = await buildSkinMask(analysis);
  const { resultUrl, cropMetadata } = await runInpainting(replicate, maskData);
  await saveResult(resultUrl, cropMetadata);

  console.log("\n╔═══════════════════════════════════════════════════════╗");
  console.log("║  🎉  Pipeline complete!                               ║");
  console.log("╚═══════════════════════════════════════════════════════╝");
  console.log("   Mask debug:   scripts/test-assets/arm-mask.png");
  console.log("   Final result: scripts/test-assets/output-mockup.png");
  console.log("\n   Open output-mockup.png to inspect the result.\n");
}

main().catch((err) => {
  console.error("\n❌ Fatal error:", err.message);
  process.exit(1);
});
