/**
 * TattoosMap — High-Fidelity Programmatic Tattoo Mockup Generator Service
 * Calibrated precisely to biologically realistic dermal and epidermal interaction.
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { supabaseAdmin } from '@/lib/supabase-admin';

const PLACEMENT_MAP: Record<string, { photo: string; zone: { x: number; y: number; w: number; h: number } }> = {
  'forearm':   { photo: '/stock-bodies/forearm.jpg',   zone: { x: 0.35, y: 0.20, w: 0.30, h: 0.32 } },
  'upper arm': { photo: '/stock-bodies/upper-arm.jpg', zone: { x: 0.30, y: 0.15, w: 0.35, h: 0.40 } },
  'chest':     { photo: '/stock-bodies/chest.jpg',     zone: { x: 0.30, y: 0.25, w: 0.40, h: 0.30 } },
  'back':      { photo: '/stock-bodies/back.jpg',      zone: { x: 0.30, y: 0.25, w: 0.40, h: 0.40 } },
  'thigh':     { photo: '/stock-bodies/thigh.jpg',     zone: { x: 0.35, y: 0.25, w: 0.30, h: 0.40 } },
  'calf':      { photo: '/stock-bodies/calf.jpg',      zone: { x: 0.40, y: 0.25, w: 0.25, h: 0.40 } },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function solidColorWithMask(r: number, g: number, b: number, mask: Buffer, rw: number, rh: number): Promise<Buffer> {
  const fill = Buffer.alloc(rw * rh * 3);
  for (let i = 0; i < fill.length; i += 3) { fill[i] = r; fill[i + 1] = g; fill[i + 2] = b; }
  return sharp(fill, { raw: { width: rw, height: rh, channels: 3 } }).joinChannel(mask).png().toBuffer();
}

async function scaleMask(mask: Buffer, maxOpacity: number): Promise<Buffer> {
  return sharp(mask).linear(maxOpacity, 0).toBuffer();
}

async function maskedTexture(gray: Buffer, scaledMask: Buffer): Promise<Buffer> {
  return sharp(gray).joinChannel(scaledMask).png().toBuffer();
}

// ─── Main Generator ──────────────────────────────────────────────────────────

export async function generateMockupsForDesign(
  designImageUrl: string,
  bestPlacement: string,
  slug: string
): Promise<{ freshUrl: string; healedUrl: string }> {
  
  const placementKey = Object.keys(PLACEMENT_MAP).find(k => bestPlacement?.toLowerCase().includes(k)) ?? 'forearm';
  const placement = PLACEMENT_MAP[placementKey];

  // ─── Phase 1: Load source assets ───────────────────────────────────────
  const photoPath = path.join(process.cwd(), 'public', placement.photo);
  const bodyBuffer = await fs.readFile(photoPath);
  const { width: bw = 1000, height: bh = 1000 } = await sharp(bodyBuffer).metadata();

  const designRes = await fetch(designImageUrl);
  if (!designRes.ok) throw new Error(`Failed to fetch design: ${designRes.status}`);
  const designBuffer = Buffer.from(await designRes.arrayBuffer());

  // ─── Phase 2: Scale and position tattoo ────────────────────────────────
  const targetW = Math.round(bw * placement.zone.w);
  const targetH = Math.round(bh * placement.zone.h);
  const targetX = Math.round(bw * placement.zone.x);
  const targetY = Math.round(bh * placement.zone.y);

  const resized = await sharp(designBuffer)
    .resize({ width: targetW, height: targetH, fit: 'inside' })
    .toBuffer();
  const { width: rw = targetW, height: rh = targetH } = await sharp(resized).metadata();
  const cx = targetX + Math.round((targetW - rw) / 2);
  const cy = targetY + Math.round((targetH - rh) / 2);

  // ─── Phase 3: Ink Alpha Mask Extraction ────────────────────────────────
  const inkMask = await sharp(resized).grayscale().negate().toBuffer();

  // ─── Phase 4: Skin Texture & Specular Extraction ───────────────────────
  const bodyCrop = await sharp(bodyBuffer)
    .extract({ left: cx, top: cy, width: rw, height: rh })
    .toBuffer();

  const specularity = await sharp(bodyCrop)
    .grayscale()
    .clahe({ width: 4, height: 4, maxSlope: 3 })
    .toBuffer();

  // ─── Phase 5: Edge-Only Dispersion Pipeline ──────────────────────
  const sobelX = await sharp(inkMask)
    .convolve({ width: 3, height: 3, kernel: [-1, 0, 1, -2, 0, 2, -1, 0, 1] })
    .toBuffer();
  const sobelY = await sharp(inkMask)
    .convolve({ width: 3, height: 3, kernel: [-1, -2, -1, 0, 0, 0, 1, 2, 1] })
    .toBuffer();
  const edgeMap = await sharp(sobelX).boolean(sobelY, 'eor').toBuffer();
  
  const dilatedEdgeMap = await sharp(edgeMap).dilate().toBuffer();
  const negatedEdgeMap = await sharp(dilatedEdgeMap).negate().toBuffer();
  
  const erodedCore = await sharp(inkMask)
    .boolean(negatedEdgeMap, 'and')
    .toBuffer();
      
  const blurredInk = await sharp(inkMask)
    .blur(0.45)
    .toBuffer();
      
  const blurredEdges = await sharp(blurredInk)
    .boolean(dilatedEdgeMap, 'and')
    .toBuffer();
      
  const finalAgedMask = await sharp(erodedCore)
    .boolean(blurredEdges, 'or')
    .toBuffer();

  // ─── Phase 6: Procedural Opacity Variation Noise ───────────────────────
  const noiseData = Buffer.alloc(rw * rh);
  for (let i = 0; i < noiseData.length; i++) {
    const x = i % rw, y = Math.floor(i / rw);
    const n = Math.sin(x * 0.31 + y * 0.17) * Math.cos(x * 0.13 - y * 0.29) * 0.5 + 0.5;
    noiseData[i] = Math.round(n * 30 + 112);
  }
  const noiseBuffer = await sharp(noiseData, { raw: { width: rw, height: rh, channels: 1 } }).png().toBuffer();

  // ═══════════════════════════════════════════════════════════════════════
  // STATE 1: FRESH INK
  // ═══════════════════════════════════════════════════════════════════════
  const glowRgba = await solidColorWithMask(235, 60, 60, inkMask, rw, rh);
  const glowLayer = await sharp(glowRgba)
    .linear([1, 1, 1, 0.28], [0, 0, 0, 0])
    .blur(5)
    .toBuffer();

  const freshInkRgba = await solidColorWithMask(22, 26, 32, inkMask, rw, rh);
  const freshInkLayer = await sharp(freshInkRgba)
    .linear([1, 1, 1, 0.88], [0, 0, 0, 0])
    .toBuffer();

  const epidermalRgba = await solidColorWithMask(22, 26, 32, inkMask, rw, rh);
  const epidermalScatter = await sharp(epidermalRgba)
    .linear([1, 1, 1, 0.08], [0, 0, 0, 0])
    .blur(0.4)
    .toBuffer();

  const freshSpecMask = await scaleMask(inkMask, 0.30);
  const freshSpecLayer = await maskedTexture(specularity, freshSpecMask);

  const bodyCropRgba = await sharp(bodyCrop).ensureAlpha().png().toBuffer();
  const wetClearcoat = await sharp(bodyCropRgba)
    .sharpen({ sigma: 1.5, m1: 0, m2: 3 })
    .linear([1, 1, 1, 0.08], [0, 0, 0, 0])
    .toBuffer();

  const freshComposite = await sharp(bodyBuffer)
    .composite([
      { input: glowLayer,        top: cy, left: cx, blend: 'multiply'   },
      { input: freshInkLayer,    top: cy, left: cx, blend: 'multiply'   },
      { input: epidermalScatter, top: cy, left: cx, blend: 'soft-light' },
      { input: freshSpecLayer,   top: cy, left: cx, blend: 'screen'     },
      { input: wetClearcoat,     top: cy, left: cx, blend: 'screen'     },
    ])
    .webp({ quality: 90 })
    .toBuffer();

  // ═══════════════════════════════════════════════════════════════════════
  // STATE 2: 5-YEAR HEALED INK
  // ═══════════════════════════════════════════════════════════════════════
  const coloredInk = await solidColorWithMask(52, 58, 66, finalAgedMask, rw, rh);

  const biasedInk = await sharp(coloredInk)
    .recomb([
      [0.98, 0.00, 0.02],
      [0.00, 1.00, 0.00],
      [0.00, 0.02, 1.00]
    ])
    .toBuffer();

  const healedInkLayer = await sharp(biasedInk)
    .linear([1, 1, 1, 0.76], [0, 0, 0, 0])
    .toBuffer();

  const noiseMaskHealed = await sharp(inkMask).boolean(noiseBuffer, 'and').toBuffer();
  const scaledNoiseMask = await sharp(noiseMaskHealed)
    .linear(0.04, 0)
    .toBuffer();
  const opacityModulator = await sharp(Buffer.alloc(rw * rh * 3, 0), { raw: { width: rw, height: rh, channels: 3 } })
    .joinChannel(scaledNoiseMask)
    .png()
    .toBuffer();

  const epidermalHealedRgba = await solidColorWithMask(52, 58, 66, inkMask, rw, rh);
  const epidermalDiffusion = await sharp(epidermalHealedRgba)
    .linear([1, 1, 1, 0.14], [0, 0, 0, 0])
    .blur(0.3)
    .toBuffer();

  const healedSpecMask = await scaleMask(inkMask, 0.32);
  const healedSpecLayer = await maskedTexture(specularity, healedSpecMask);

  const healedComposite = await sharp(bodyBuffer)
    .composite([
      { input: healedInkLayer,     top: cy, left: cx, blend: 'multiply'   },
      { input: opacityModulator,   top: cy, left: cx, blend: 'multiply'   },
      { input: epidermalDiffusion, top: cy, left: cx, blend: 'soft-light' },
      { input: healedSpecLayer,    top: cy, left: cx, blend: 'screen'     },
    ])
    .webp({ quality: 90 })
    .toBuffer();

  // ─── Upload ─────────────────────────────────────────────────────────────
  const ts = Date.now();
  const freshFilename  = `mockups/fresh-${slug}-${ts}.webp`;
  const healedFilename = `mockups/healed-${slug}-${ts}.webp`;

  const [fu, hu] = await Promise.all([
    supabaseAdmin.storage.from('designs').upload(freshFilename,  freshComposite,  { contentType: 'image/webp', upsert: true }),
    supabaseAdmin.storage.from('designs').upload(healedFilename, healedComposite, { contentType: 'image/webp', upsert: true }),
  ]);
  if (fu.error) throw new Error(`Fresh upload failed: ${fu.error.message}`);
  if (hu.error) throw new Error(`Healed upload failed: ${hu.error.message}`);

  const domain = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://smrnldmbvtflavzswghh.supabase.co';
  const freshUrl  = `${domain}/storage/v1/object/public/designs/${freshFilename}`;
  const healedUrl = `${domain}/storage/v1/object/public/designs/${healedFilename}`;

  return { freshUrl, healedUrl };
}
