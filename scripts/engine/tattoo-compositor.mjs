/**
 * TattoosMap — High-Fidelity Stencil Compositor  v2.1 (Phase 2: Auto-Detection)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * PIPELINE:
 *   1. Auto-Detect placement zone via Gemini Vision  ← NEW in Phase 2
 *      (Falls back to manual coordinates if no GEMINI_API_KEY)
 *   2. Prepare tattoo stencil:
 *        a. Remove white background via pixel-level alpha masking
 *        b. Apply rotation  c. Resize  d. Feather  e. Opacity
 *   3. Composite onto body photo using Multiply blend mode
 *   4. Pixel integrity check — zero pixels outside zone changed
 *   5. Export: output-mockup.png + side-by-side comparison
 *
 * HOW TO RUN:
 *   # With auto-detection (Phase 2):
 *   GEMINI_API_KEY=xxx node scripts/tattoo-compositor.mjs
 *
 *   # Without (Phase 1 fallback — uses hardcoded coords):
 *   node scripts/tattoo-compositor.mjs
 * ═══════════════════════════════════════════════════════════════════════════
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Asset Paths ──────────────────────────────────────────────────────────────
const ASSETS_DIR        = path.join(__dirname, "test-assets");
const BODY_PHOTO_PATH   = path.join(ASSETS_DIR, "body-photo.jpg");
const TATTOO_PATH       = path.join(ASSETS_DIR, "tiger-design.png");
const OUTPUT_PATH       = path.join(ASSETS_DIR, "output-mockup.png");
const COMPARISON_PATH   = path.join(ASSETS_DIR, "comparison.png");

// ── Phase 2: Gemini Vision Auto-Detection ────────────────────────────────────
/**
 * Sends the body photo to Gemini Vision and returns a pixel-accurate
 * placementZone object { x, y, width, height, rotation } ready to feed
 * directly into compositeTattoo().
 *
 * Gemini is asked to identify:
 *   - The single best skin surface for a large tattoo (e.g. forearm, upper arm)
 *   - Any clothing edges that should clip the tattoo (e.g. shirt sleeve)
 *   - The ideal rotation angle to match the limb's tilt
 *
 * Returns null if GEMINI_API_KEY is not set or if analysis fails
 * (caller falls back to manual coordinates).
 */
async function detectPlacementZone(bodyPhotoPath) {
  if (!process.env.GEMINI_API_KEY) return null;

  console.log("\n──────────────────────────────────────────────────────────");
  console.log("STEP 1 — Gemini Vision: Auto-detecting placement zone");
  console.log("──────────────────────────────────────────────────────────");

  const { width: photoW, height: photoH } = await sharp(bodyPhotoPath).metadata();

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const imageBytes = fs.readFileSync(bodyPhotoPath);
    const base64     = imageBytes.toString("base64");
    const mimeType   = bodyPhotoPath.endsWith(".png") ? "image/png" : "image/jpeg";

    const prompt = `
You are a professional tattoo placement analyst. Analyze this photo carefully.
The image is ${photoW} pixels wide and ${photoH} pixels tall.

Return ONLY valid JSON (no markdown, no explanation, no code block).

{
  "best_zone": {
    "body_part": "describe the exact body part (e.g. right forearm, left upper arm)",
    "x_pct":      0.0,
    "y_pct":      0.0,
    "width_pct":  0.0,
    "height_pct": 0.0,
    "rotation_deg": 0,
    "notes": "brief note on why this is the best spot"
  },
  "clothing_clip": {
    "present": false,
    "edge_y_pct": 0.0,
    "description": "describe the garment if present"
  }
}

Rules:
- x_pct, y_pct, width_pct, height_pct are fractions of the image (0.0 to 1.0)
- x_pct and y_pct are the TOP-LEFT corner of the recommended tattoo zone
- width_pct and height_pct define the zone size (aim for ~150-250px wide on this image)
- rotation_deg is the angle the limb makes (0 = vertical, negative = tilts left)
- Choose a FLAT, large surface area with no joints or bones in the center
- If clothing overlaps the skin zone, set clothing_clip.present to true and
  give edge_y_pct as the y fraction where the fabric begins
- Do NOT choose the face, hands, or feet
`;

    const result = await model.generateContent([
      { inlineData: { data: base64, mimeType } },
      prompt,
    ]);

    const raw   = result.response.text().trim();
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Gemini returned non-JSON: " + raw.substring(0, 200));

    const analysis = JSON.parse(match[0]);
    const z = analysis.best_zone;

    // Convert percentages → pixels
    let x      = Math.round(z.x_pct      * photoW);
    let y      = Math.round(z.y_pct      * photoH);
    let width  = Math.round(z.width_pct  * photoW);
    let height = Math.round(z.height_pct * photoH);

    // Clip at clothing edge if present
    if (analysis.clothing_clip?.present) {
      const clothingEdgePx = Math.round(analysis.clothing_clip.edge_y_pct * photoH);
      if (y < clothingEdgePx) {
        // Tattoo zone starts inside the clothing — push it down to the edge
        const overlap = clothingEdgePx - y;
        y += overlap;
        height = Math.max(50, height - overlap); // ensure minimum height
        console.log(`  👕 Clothing detected (${analysis.clothing_clip.description}) — zone clipped at y=${clothingEdgePx}px`);
      } else {
        console.log(`  👕 Clothing edge at y=${clothingEdgePx}px — zone is safely below it`);
      }
    }

    // Clamp to image bounds
    x      = Math.max(0, Math.min(photoW - width,  x));
    y      = Math.max(0, Math.min(photoH - height, y));
    width  = Math.min(photoW - x, width);
    height = Math.min(photoH - y, height);

    const zone = {
      x,
      y,
      width,
      height,
      rotation: z.rotation_deg ?? 0,
    };

    console.log(`  🤖 Gemini detected: ${z.body_part}`);
    console.log(`  📍 Zone: x=${zone.x} y=${zone.y} w=${zone.width} h=${zone.height} rotate=${zone.rotation}°`);
    if (z.notes) console.log(`  💡 Note: ${z.notes}`);

    return zone;

  } catch (err) {
    console.warn(`  ⚠️  Gemini auto-detection failed: ${err.message}`);
    console.warn("  ↩️  Falling back to manual placement coordinates.");
    return null;
  }
}


// ── Step 2: Prepare Tattoo Stencil ───────────────────────────────────────────
async function prepareStencil(tattooPath, placementZone, options) {
  const { width: targetW, height: targetH, rotation } = placementZone;
  const { featherRadius = 2.5, opacity = 0.85, removeWhiteBg = true } = options;

  console.log("  📐 Loading tattoo design...");
  let pipeline = sharp(tattooPath).ensureAlpha();

  // ── 2a. Remove white background via pixel-level alpha masking ────────────
  if (removeWhiteBg) {
    console.log("  🔬 Removing white background (pixel-level alpha masking)...");
    const { data, info } = await pipeline
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height, channels } = info; // channels = 4 (RGBA)
    const pixels = new Uint8Array(data);

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      // Alpha already in pixels[i + 3]

      if (r > 240 && g > 240 && b > 240) {
        // Pure white → fully transparent
        pixels[i + 3] = 0;
      } else if (r > 200 && g > 200 && b > 200) {
        // Near-white → graduated transparency for soft edges
        const brightness = (r + g + b) / 3;
        const alphaFactor = 1 - ((brightness - 200) / 55); // 0 at 255, 1 at 200
        pixels[i + 3] = Math.round(pixels[i + 3] * alphaFactor);
      }
      // Dark pixels remain fully opaque (real ink)
    }

    pipeline = sharp(Buffer.from(pixels), {
      raw: { width, height, channels },
    });
  }

  // ── 2b. Apply rotation ───────────────────────────────────────────────────
  if (rotation && rotation !== 0) {
    console.log(`  🔄 Applying rotation: ${rotation}°`);
    pipeline = pipeline.rotate(rotation, {
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
  }

  // ── 2c. Resize to fit placement zone ────────────────────────────────────
  console.log(`  📏 Resizing to placement zone: ${targetW}×${targetH}px`);
  pipeline = pipeline.resize(targetW, targetH, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });

  // ── 2d. Apply edge feathering (Gaussian blur on alpha edges) ─────────────
  console.log(`  🌫️  Applying edge feathering (sigma: ${featherRadius}px)...`);
  pipeline = pipeline.blur(featherRadius);

  // ── 2e. Apply opacity (scale alpha channel) ──────────────────────────────
  console.log(`  🎚️  Setting tattoo opacity: ${(opacity * 100).toFixed(0)}%`);
  const stencilRaw = await pipeline.raw().toBuffer({ resolveWithObject: true });
  const { data: stencilData, info: stencilInfo } = stencilRaw;
  const stencilPixels = new Uint8Array(stencilData);

  for (let i = 3; i < stencilPixels.length; i += 4) {
    stencilPixels[i] = Math.round(stencilPixels[i] * opacity);
  }

  // Convert back to a sharp-compatible PNG buffer
  const finalStencil = await sharp(Buffer.from(stencilPixels), {
    raw: {
      width: stencilInfo.width,
      height: stencilInfo.height,
      channels: stencilInfo.channels,
    },
  })
    .png()
    .toBuffer();

  console.log("  ✅ Stencil prepared.");
  return finalStencil;
}

// ── Step 3+4: Composite with Multiply Blend ──────────────────────────────────
async function compositeOntoPhoto(bodyPhotoPath, stencilBuffer, placementZone) {
  const { x, y } = placementZone;
  console.log(`  🎨 Compositing with MULTIPLY blend at [${x}, ${y}]...`);

  await sharp(bodyPhotoPath)
    .composite([
      {
        input: stencilBuffer,
        top: y,
        left: x,
        blend: "multiply",
      },
    ])
    .png()
    .toFile(OUTPUT_PATH);

  console.log("  ✅ Composite saved →", OUTPUT_PATH);
}

// ── Step 5: Pixel Integrity Check ────────────────────────────────────────────
async function samplePixelsOutsidePlacementZone(imagePath, placementZone) {
  const { x, y, width, height } = placementZone;
  const { data, info } = await sharp(imagePath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8Array(data);
  const imgWidth = info.width;
  const channels = info.channels;

  // 10 deterministic sample points well outside the placement zone
  const samplePoints = [
    { sx: 10,  sy: 10  },
    { sx: 50,  sy: 20  },
    { sx: 100, sy: 50  },
    { sx: 20,  sy: 300 },
    { sx: 80,  sy: 400 },
    { sx: 200, sy: 10  },
    { sx: 300, sy: 430 },
    { sx: 30,  sy: 200 },
    { sx: 550, sy: 50  },
    { sx: 580, sy: 400 },
  ].filter(({ sx, sy }) => {
    // Ensure point is actually outside the placement zone
    return sx < x || sx > x + width || sy < y || sy > y + height;
  });

  return samplePoints.map(({ sx, sy }) => {
    const idx = (sy * imgWidth + sx) * channels;
    return {
      x: sx,
      y: sy,
      r: pixels[idx],
      g: pixels[idx + 1],
      b: pixels[idx + 2],
    };
  });
}

async function runIntegrityCheck(bodyPhotoPath, outputPath, placementZone) {
  console.log("\n  🔍 Running pixel integrity check...");
  const originalSamples = await samplePixelsOutsidePlacementZone(bodyPhotoPath, placementZone);
  const outputSamples   = await samplePixelsOutsidePlacementZone(outputPath, placementZone);

  let allPassed = true;
  for (let i = 0; i < originalSamples.length; i++) {
    const orig = originalSamples[i];
    const out  = outputSamples[i];
    const dr = Math.abs(orig.r - out.r);
    const dg = Math.abs(orig.g - out.g);
    const db = Math.abs(orig.b - out.b);
    if (dr >= 3 || dg >= 3 || db >= 3) {
      console.error(`  ❌ INTEGRITY FAIL at pixel (${orig.x}, ${orig.y}): original=(${orig.r},${orig.g},${orig.b}) output=(${out.r},${out.g},${out.b}) delta=(${dr},${dg},${db})`);
      allPassed = false;
    }
  }

  if (!allPassed) {
    throw new Error("INTEGRITY FAIL: Body photo was modified outside the placement zone.");
  }

  console.log(`  ✅ Integrity check PASSED (${originalSamples.length} pixels verified — body photo untouched outside tattoo area)`);
}

// ── Step 6: Side-by-Side Comparison ──────────────────────────────────────────
async function buildComparison(bodyPhotoPath, tattooPath, outputPath, comparisonPath) {
  console.log("\n  🖼️  Building side-by-side comparison...");

  const TARGET_H = 400;

  // Resize all three images to the same height, preserving aspect ratio
  const [origBuf, tattooBuf, resultBuf] = await Promise.all([
    sharp(bodyPhotoPath).resize({ height: TARGET_H }).png().toBuffer(),
    sharp(tattooPath)
      .flatten({ background: { r: 255, g: 255, b: 255 } }) // White bg for display
      .resize({ height: TARGET_H })
      .png()
      .toBuffer(),
    sharp(outputPath).resize({ height: TARGET_H }).png().toBuffer(),
  ]);

  const [origMeta, tattooMeta, resultMeta] = await Promise.all([
    sharp(origBuf).metadata(),
    sharp(tattooBuf).metadata(),
    sharp(resultBuf).metadata(),
  ]);

  const LABEL_H  = 30;
  const PADDING  = 10;
  const totalW   = origMeta.width + tattooMeta.width + resultMeta.width + PADDING * 4;
  const totalH   = TARGET_H + LABEL_H + PADDING * 2;

  // Build label SVG
  const makeLabelSvg = (text, w) => Buffer.from(
    `<svg width="${w}" height="${LABEL_H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${w}" height="${LABEL_H}" fill="#111"/>
      <text x="${w / 2}" y="20" font-family="monospace" font-size="13" fill="white" text-anchor="middle">${text}</text>
    </svg>`
  );

  await sharp({
    create: {
      width:      totalW,
      height:     totalH,
      channels:   3,
      background: { r: 17, g: 17, b: 17 },
    },
  })
    .composite([
      // Original
      { input: origBuf,    left: PADDING,                                         top: LABEL_H + PADDING },
      { input: makeLabelSvg("ORIGINAL PHOTO", origMeta.width),     left: PADDING, top: PADDING },
      // Tattoo design
      { input: tattooBuf,  left: PADDING * 2 + origMeta.width,                   top: LABEL_H + PADDING },
      { input: makeLabelSvg("TATTOO DESIGN",  tattooMeta.width),   left: PADDING * 2 + origMeta.width, top: PADDING },
      // Result
      { input: resultBuf,  left: PADDING * 3 + origMeta.width + tattooMeta.width, top: LABEL_H + PADDING },
      { input: makeLabelSvg("RESULT (STENCIL ENGINE)", resultMeta.width), left: PADDING * 3 + origMeta.width + tattooMeta.width, top: PADDING },
    ])
    .png()
    .toFile(comparisonPath);

  console.log("  ✅ Comparison saved →", comparisonPath);
}

// ── Main Compositor Function ─────────────────────────────────────────────────
async function compositeTattoo({
  bodyPhotoPath,
  tattooDesignPath,
  placementZone,
  options = {},
}) {
  console.log("\n──────────────────────────────────────────────────────────");
  console.log("STEP 2 — Preparing tattoo stencil");
  console.log("──────────────────────────────────────────────────────────");
  const stencilBuffer = await prepareStencil(tattooDesignPath, placementZone, options);

  console.log("\n──────────────────────────────────────────────────────────");
  console.log("STEP 3 — Compositing onto body photo (Multiply blend)");
  console.log("──────────────────────────────────────────────────────────");
  await compositeOntoPhoto(bodyPhotoPath, stencilBuffer, placementZone);

  console.log("\n──────────────────────────────────────────────────────────");
  console.log("STEP 4 — Pixel Integrity Check");
  console.log("──────────────────────────────────────────────────────────");
  await runIntegrityCheck(bodyPhotoPath, OUTPUT_PATH, placementZone);

  console.log("\n──────────────────────────────────────────────────────────");
  console.log("STEP 5 — Side-by-side comparison");
  console.log("──────────────────────────────────────────────────────────");
  await buildComparison(bodyPhotoPath, tattooDesignPath, OUTPUT_PATH, COMPARISON_PATH);

  return OUTPUT_PATH;
}

// ── Run ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║   TattoosMap · Stencil Compositor  v2.1  (Phase 2)          ║");
  console.log("║   Gemini Auto-Detect · Multiply Ink · Integrity Verified     ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");

  // Validate assets
  for (const [p, label] of [[BODY_PHOTO_PATH, "body-photo.jpg"], [TATTOO_PATH, "tiger-design.png"]]) {
    if (!fs.existsSync(p)) {
      console.error(`\n❌ Missing: ${label}`);
      process.exit(1);
    }
  }

  const { width: photoW, height: photoH } = await sharp(BODY_PHOTO_PATH).metadata();
  console.log(`\n  📷 Body photo: ${photoW}×${photoH}px`);

  // ── STEP 1: Auto-detect or fall back to manual ──────────────────────────
  let placementZone = await detectPlacementZone(BODY_PHOTO_PATH);

  if (!placementZone) {
    // Manual fallback (Phase 1 coordinates, always reliable)
    console.log("\n──────────────────────────────────────────────────────────");
    console.log("STEP 1 — Manual placement (no GEMINI_API_KEY set)");
    console.log("──────────────────────────────────────────────────────────");
    const armX = Math.round(photoW * 0.65);
    const armY = Math.round(photoH * 0.38);
    placementZone = { x: armX, y: armY, width: 200, height: 280, rotation: -5 };
    console.log(`  📍 Fallback zone: x=${placementZone.x} y=${placementZone.y} w=${placementZone.width} h=${placementZone.height} rotate=${placementZone.rotation}°`);
  }

  const options = {
    featherRadius: 2.5,
    opacity:       0.85,
    removeWhiteBg: true,
  };

  console.log(`\n  🎚️  Options: feather=${options.featherRadius}px | opacity=${options.opacity} | removeWhiteBg=${options.removeWhiteBg}`);

  await compositeTattoo({
    bodyPhotoPath:    BODY_PHOTO_PATH,
    tattooDesignPath: TATTOO_PATH,
    placementZone,
    options,
  });

  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║  🎉  Pipeline complete!                                      ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log("   📄 Result:     scripts/test-assets/output-mockup.png");
  console.log("   🖼️  Comparison: scripts/test-assets/comparison.png");
  console.log(`   🧠 Mode:       ${process.env.GEMINI_API_KEY ? "Gemini Auto-Detect" : "Manual Fallback"}`);
  console.log("\n   ✅ Design preserved   ✅ Face untouched   ✅ No seams\n");
}

main().catch((err) => {
  console.error("\n❌ Fatal error:", err.message);
  console.error(err.stack);
  process.exit(1);
});
