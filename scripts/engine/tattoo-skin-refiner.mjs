/**
 * TattoosMap — Phase 3: Skin Realism Refiner
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Takes the Phase 2 stencil output (output-mockup.png) and applies a
 * professional-grade local skin refinement pass to make the tattoo look
 * like it has been healed into real skin.
 *
 * TECHNIQUES (100% local, zero cloud cost):
 *   1. Skin grain — adds micro-noise to the tattoo zone, simulating pores
 *   2. Ink aging  — desaturates ink slightly (healed = 15% less vibrant)
 *   3. Edge depth — adds a subtle shadow gradient to the top/left of the zone
 *   4. Texture sharpening — crispens the ink/skin boundary
 *
 * HOW TO RUN:
 *   node scripts/tattoo-skin-refiner.mjs
 *
 *   (Run AFTER tattoo-compositor.mjs — reads output-mockup.png as input)
 *
 * OUTPUT:
 *   scripts/test-assets/output-refined.png   ← Phase 3 result
 *   scripts/test-assets/comparison-refined.png ← Phase 2 vs Phase 3
 * ═══════════════════════════════════════════════════════════════════════════
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ASSETS_DIR        = path.join(__dirname, "test-assets");
const STENCIL_OUTPUT    = path.join(ASSETS_DIR, "output-mockup.png");   // Phase 2 input
const REFINED_OUTPUT    = path.join(ASSETS_DIR, "output-refined.png");  // Phase 3 output
const COMPARISON_PATH   = path.join(ASSETS_DIR, "comparison-refined.png");

// ── The same placement zone used in the compositor ───────────────────────────
// These must match tattoo-compositor.mjs exactly
const PLACEMENT_ZONE = {
  x:        404,
  y:        176,
  width:    200,
  height:   280,
  rotation: -5,
};

// ── Technique 1: Skin Grain (Pore Simulation) ─────────────────────────────────
/**
 * Generates a random noise layer (RGBA) the same size as the tattoo zone.
 * The noise is subtle (±8-12 per channel) to simulate skin grain and pores.
 * Alpha is set per-pixel based on a soft elliptical falloff so the grain
 * fades out toward the edges (matches the feathered stencil).
 */
function generateGrainLayer(width, height, intensity = 10) {
  const pixels = new Uint8Array(width * height * 4);
  const cx = width  / 2;
  const cy = height / 2;
  const rx = width  / 2;
  const ry = height / 2;

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const i = (row * width + col) * 4;

      // Elliptical distance from center (0 at center, 1 at edge)
      const dx = (col - cx) / rx;
      const dy = (row - cy) / ry;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const edgeFalloff = Math.max(0, 1 - dist); // 1 at center, 0 at/beyond edge

      // Random noise value — symmetric around grey (128)
      const noise = Math.round((Math.random() - 0.5) * 2 * intensity);

      pixels[i]     = 128 + noise; // R
      pixels[i + 1] = 128 + noise; // G (grey noise = no color cast)
      pixels[i + 2] = 128 + noise; // B

      // Alpha: subtle at center, zero at edges (so it stays in the stencil)
      pixels[i + 3] = Math.round(edgeFalloff * 18); // max alpha ~18/255 = 7%
    }
  }

  return Buffer.from(pixels);
}

// ── Technique 3: Edge Depth Shadow ────────────────────────────────────────────
/**
 * Adds a subtle directional shadow from the top and left edges of the placement
 * zone, simulating the 3D curvature of the arm pushing light from the top.
 */
function generateShadowLayer(width, height) {
  const pixels = new Uint8Array(width * height * 4);
  const SHADOW_DEPTH = 40; // pixels for shadow gradient

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const i = (row * width + col) * 4;

      // Top shadow (darkest at top, fades over SHADOW_DEPTH pixels)
      const topAlpha = Math.max(0, 1 - row / SHADOW_DEPTH) * 30;

      // Left edge shadow (subtle)
      const leftAlpha = Math.max(0, 1 - col / (SHADOW_DEPTH * 0.5)) * 12;

      const alpha = Math.min(255, topAlpha + leftAlpha);

      pixels[i]     = 0;   // R (black shadow)
      pixels[i + 1] = 0;   // G
      pixels[i + 2] = 0;   // B
      pixels[i + 3] = Math.round(alpha);
    }
  }

  return Buffer.from(pixels);
}

// ── Main Refiner ───────────────────────────────────────────────────────────────
async function refineSkin() {
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║   TattoosMap · Phase 3: Skin Realism Refiner               ║");
  console.log("║   Grain · Ink Aging · Edge Depth · Texture Sharpening       ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");

  if (!fs.existsSync(STENCIL_OUTPUT)) {
    console.error("\n❌ Missing: output-mockup.png");
    console.error("   Run tattoo-compositor.mjs first.");
    process.exit(1);
  }

  const { x, y, width, height } = PLACEMENT_ZONE;
  const { width: photoW, height: photoH } = await sharp(STENCIL_OUTPUT).metadata();
  console.log(`\n  📷 Stencil output: ${photoW}×${photoH}px`);
  console.log(`  📍 Refining tattoo zone: x=${x} y=${y} w=${width} h=${height}`);

  // ── Extract the tattoo zone from the stencil output ────────────────────
  console.log("\n──────────────────────────────────────────────────────────");
  console.log("STEP 1 — Extracting tattoo zone for refinement");
  console.log("──────────────────────────────────────────────────────────");

  const tattooZoneBuf = await sharp(STENCIL_OUTPUT)
    .extract({ left: x, top: y, width, height })
    .png()
    .toBuffer();

  // ── Technique 2: Ink Aging — desaturate the zone slightly ──────────────
  console.log("\n──────────────────────────────────────────────────────────");
  console.log("STEP 2 — Ink Aging (desaturation for healed look)");
  console.log("──────────────────────────────────────────────────────────");

  const agedZone = await sharp(tattooZoneBuf)
    .modulate({
      saturation: 0.88,   // 12% desaturation — healed ink looks muted
      brightness: 1.02,   // 2% brightness boost — aged ink lifts slightly
    })
    .toBuffer();

  console.log("  ✅ Ink aging applied (saturation: 88%, brightness: +2%)");

  // ── Technique 1: Skin Grain ─────────────────────────────────────────────
  console.log("\n──────────────────────────────────────────────────────────");
  console.log("STEP 3 — Skin Grain (pore simulation)");
  console.log("──────────────────────────────────────────────────────────");

  const grainBuffer = generateGrainLayer(width, height, 10);
  const grainLayer  = await sharp(grainBuffer, {
    raw: { width, height, channels: 4 },
  }).png().toBuffer();

  const grainedZone = await sharp(agedZone)
    .composite([{ input: grainLayer, blend: "overlay" }])
    .toBuffer();

  console.log("  ✅ Skin grain applied (overlay blend, ±10 intensity, 7% max alpha)");

  // ── Technique 4: Texture Sharpening ─────────────────────────────────────
  console.log("\n──────────────────────────────────────────────────────────");
  console.log("STEP 4 — Texture sharpening (ink/skin boundary crispening)");
  console.log("──────────────────────────────────────────────────────────");

  const sharpenedZone = await sharp(grainedZone)
    .sharpen({ sigma: 0.8, m1: 0.5, m2: 0.5 })
    .toBuffer();

  console.log("  ✅ Texture sharpening applied (sigma: 0.8)");

  // ── Technique 3: Edge Depth Shadow ──────────────────────────────────────
  console.log("\n──────────────────────────────────────────────────────────");
  console.log("STEP 5 — Edge Depth Shadow (3D arm curvature)");
  console.log("──────────────────────────────────────────────────────────");

  const shadowBuffer = generateShadowLayer(width, height);
  const shadowLayer  = await sharp(shadowBuffer, {
    raw: { width, height, channels: 4 },
  }).png().toBuffer();

  const refinedZone = await sharp(sharpenedZone)
    .composite([{ input: shadowLayer, blend: "multiply" }])
    .png()
    .toBuffer();

  console.log("  ✅ Edge depth shadow applied (top-left directional, max 42/255 alpha)");

  // ── Composite refined zone back onto the stencil output ─────────────────
  console.log("\n──────────────────────────────────────────────────────────");
  console.log("STEP 6 — Compositing refined zone back onto photo");
  console.log("──────────────────────────────────────────────────────────");

  await sharp(STENCIL_OUTPUT)
    .composite([{ input: refinedZone, left: x, top: y }])
    .png()
    .toFile(REFINED_OUTPUT);

  console.log("  ✅ Refined output saved →", REFINED_OUTPUT);

  // ── Build Phase 2 vs Phase 3 comparison ─────────────────────────────────
  console.log("\n──────────────────────────────────────────────────────────");
  console.log("STEP 7 — Building Phase 2 vs Phase 3 comparison");
  console.log("──────────────────────────────────────────────────────────");

  const TARGET_H  = 400;
  const LABEL_H   = 40;
  const PADDING   = 10;

  const [phase2Buf, phase3Buf] = await Promise.all([
    sharp(STENCIL_OUTPUT).resize({ height: TARGET_H }).png().toBuffer(),
    sharp(REFINED_OUTPUT).resize({ height: TARGET_H }).png().toBuffer(),
  ]);

  const [p2Meta, p3Meta] = await Promise.all([
    sharp(phase2Buf).metadata(),
    sharp(phase3Buf).metadata(),
  ]);

  const makeLabelSvg = (text, subtext, w) => Buffer.from(
    `<svg width="${w}" height="${LABEL_H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${w}" height="${LABEL_H}" fill="#111"/>
      <text x="${w / 2}" y="16" font-family="monospace" font-size="11" fill="#aaa" text-anchor="middle">${text}</text>
      <text x="${w / 2}" y="32" font-family="monospace" font-size="10" fill="#666" text-anchor="middle">${subtext}</text>
    </svg>`
  );

  const totalW = p2Meta.width + p3Meta.width + PADDING * 3;
  const totalH = TARGET_H + LABEL_H + PADDING * 2;

  await sharp({
    create: { width: totalW, height: totalH, channels: 3, background: { r: 17, g: 17, b: 17 } },
  })
    .composite([
      { input: phase2Buf, left: PADDING,                       top: LABEL_H + PADDING },
      { input: makeLabelSvg("PHASE 2 — STENCIL ENGINE", "Multiply blend · No skin texture", p2Meta.width), left: PADDING, top: PADDING },
      { input: phase3Buf, left: PADDING * 2 + p2Meta.width,   top: LABEL_H + PADDING },
      { input: makeLabelSvg("PHASE 3 — SKIN REFINER", "Grain · Aging · Depth · Sharpen", p3Meta.width), left: PADDING * 2 + p2Meta.width, top: PADDING },
    ])
    .png()
    .toFile(COMPARISON_PATH);

  console.log("  ✅ Comparison saved →", COMPARISON_PATH);

  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║  🎉  Skin Realism Pass complete!                             ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log("   📄 Refined:    scripts/test-assets/output-refined.png");
  console.log("   🖼️  Comparison: scripts/test-assets/comparison-refined.png");
  console.log("\n   ✅ Grain     ✅ Ink Aging     ✅ Edge Depth     ✅ Sharpened\n");
}

refineSkin().catch((err) => {
  console.error("\n❌ Fatal error:", err.message);
  console.error(err.stack);
  process.exit(1);
});
