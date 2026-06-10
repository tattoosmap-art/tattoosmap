/**
 * POST /api/try-on/composite
 *
 * Receives:
 *   - bodyPhoto    (File)   — the person's photo
 *   - tattooDesign (File)   — the tattoo PNG
 *   - placement    (JSON)   — { x, y, width, height, rotation }
 *   - options      (JSON)   — { opacity, featherRadius, removeWhiteBg }
 *
 * Returns:
 *   - 200 image/png  — the composited result
 *   - 400/500 JSON   — error
 *
 * Runs the exact same pipeline as tattoo-compositor.mjs but server-side,
 * streaming the PNG result directly back to the client.
 */

import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const maxDuration = 30; // 30s Vercel function timeout

// ── Helper: Remove White Background (pixel-level) ──────────────────────────
async function removeWhiteBackground(imageBuffer: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(imageBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const pixels = new Uint8Array(data);

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    if (r > 240 && g > 240 && b > 240) {
      pixels[i + 3] = 0; // Pure white → transparent
    } else if (r > 200 && g > 200 && b > 200) {
      const brightness = (r + g + b) / 3;
      const alphaFactor = 1 - (brightness - 200) / 55;
      pixels[i + 3] = Math.round(pixels[i + 3] * alphaFactor);
    }
  }

  return sharp(Buffer.from(pixels), { raw: { width, height, channels } })
    .png()
    .toBuffer();
}

// ── Helper: Apply Opacity ───────────────────────────────────────────────────
async function applyOpacity(imageBuffer: Buffer, opacity: number): Promise<Buffer> {
  const { data, info } = await sharp(imageBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const pixels = new Uint8Array(data);

  for (let i = 3; i < pixels.length; i += 4) {
    pixels[i] = Math.round(pixels[i] * opacity);
  }

  return sharp(Buffer.from(pixels), { raw: { width, height, channels } })
    .png()
    .toBuffer();
}

// ── Helper: Sample pixels outside placement zone ───────────────────────────
async function samplePixelsOutside(
  imageBuffer: Buffer,
  zone: { x: number; y: number; width: number; height: number }
) {
  const { data, info } = await sharp(imageBuffer).raw().toBuffer({ resolveWithObject: true });
  const pixels = new Uint8Array(data);
  const { width, channels } = info;
  const { x, y, width: zw, height: zh } = zone;

  const samplePoints = [
    { sx: 10, sy: 10 }, { sx: 50, sy: 20 }, { sx: 100, sy: 50 },
    { sx: 20, sy: 300 }, { sx: 80, sy: Math.min(400, info.height - 5) },
    { sx: 200, sy: 10 }, { sx: 30, sy: 200 }, { sx: 50, sy: 100 },
    { sx: Math.min(550, info.width - 5), sy: 50 },
    { sx: Math.min(580, info.width - 5), sy: Math.min(400, info.height - 5) },
  ].filter(({ sx, sy }) => sx < x || sx > x + zw || sy < y || sy > y + zh);

  return samplePoints.map(({ sx, sy }) => {
    const idx = (sy * width + sx) * channels;
    return { x: sx, y: sy, r: pixels[idx], g: pixels[idx + 1], b: pixels[idx + 2] };
  });
}

// ── Main Handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const bodyPhotoFile   = formData.get("bodyPhoto")   as File | null;
    const tattooDesignFile = formData.get("tattooDesign") as File | null;
    const placementJson   = formData.get("placement")   as string | null;
    const optionsJson     = formData.get("options")     as string | null;

    if (!bodyPhotoFile || !tattooDesignFile) {
      return NextResponse.json({ error: "Missing bodyPhoto or tattooDesign" }, { status: 400 });
    }

    const placement = placementJson
      ? JSON.parse(placementJson)
      : { x: 200, y: 150, width: 200, height: 280, rotation: 0 };

    const options = optionsJson
      ? JSON.parse(optionsJson)
      : { opacity: 0.85, featherRadius: 2.5, removeWhiteBg: true };

    const { x, y, width, height, rotation } = placement;
    const { opacity = 0.85, featherRadius = 2.5, removeWhiteBg = true } = options;

    // Convert Files to Buffers
    const bodyBuffer   = Buffer.from(await bodyPhotoFile.arrayBuffer());
    const tattooBuffer = Buffer.from(await tattooDesignFile.arrayBuffer());

    // ── Step 2a: Remove white background ──────────────────────────────────
    let stencil = removeWhiteBg
      ? await removeWhiteBackground(tattooBuffer)
      : await sharp(tattooBuffer).ensureAlpha().png().toBuffer();

    // ── Step 2b: Rotate ────────────────────────────────────────────────────
    if (rotation && rotation !== 0) {
      stencil = await sharp(stencil)
        .rotate(rotation, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();
    }

    // ── Step 2c: Resize ────────────────────────────────────────────────────
    stencil = await sharp(stencil)
      .resize(width, height, { 
        fit: "contain", 
        background: { r: 0, g: 0, b: 0, alpha: 0 },
        kernel: sharp.kernel.lanczos3 
      })
      .png()
      .toBuffer();

    // ── Step 2d: Feather ───────────────────────────────────────────────────
    if (featherRadius > 0) {
      stencil = await sharp(stencil).blur(featherRadius).png().toBuffer();
    }

    // ── Step 2e: Opacity ───────────────────────────────────────────────────
    stencil = await applyOpacity(stencil, opacity);

    // ── Step 3: Composite All Layers (Tattoo + Watermark) ─────────────────
    const metadata = await sharp(bodyBuffer).metadata();
    const bodyW = metadata.width || 1200;
    const bodyH = metadata.height || 800;

    // --- Established Standard: Gallery Editorial Watermark ---
    // Matches logic in src/lib/downloadImage.ts
    const fontSize   = Math.max(14, Math.round(bodyW * 0.018));
    const padding    = Math.round(bodyW * 0.025);
    const barPadX    = Math.round(fontSize * 0.7);
    const barPadY    = Math.round(fontSize * 0.5);
    
    // For monospaced text, width is predictable (approx 0.6em per char)
    // "TATTOOSMAP" is 10 chars. Plus letter-spacing factor.
    const textWidth  = Math.round(fontSize * 10 * 0.75); // Safe estimate for mono
    const barW       = textWidth + barPadX * 2;
    const barH       = fontSize + barPadY * 2;

    const svgWatermark = `
      <svg width="${barW}" height="${barH}" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="${barW}" height="${barH}" fill="rgba(0, 0, 0, 0.42)" />
        <text 
          x="50%" 
          y="50%" 
          font-family="'DM Mono', monospace" 
          font-weight="500" 
          font-size="${fontSize}px" 
          letter-spacing="2px"
          fill="rgba(255, 255, 255, 0.82)" 
          text-anchor="middle" 
          dominant-baseline="central"
        >TATTOOSMAP</text>
      </svg>
    `;

    const outputBuffer = await sharp(bodyBuffer)
      .composite([
        { input: stencil, top: y, left: x, blend: "multiply" },
        {
          input: Buffer.from(svgWatermark),
          top: Math.round(bodyH - barH - padding),
          left: Math.round(bodyW - barW - padding),
          blend: "over"
        }
      ])
      .jpeg({ quality: 95 })
      .toBuffer();

    // ── Step 4: Pixel Integrity Check ──────────────────────────────────────
    const origSamples = await samplePixelsOutside(bodyBuffer, { x, y, width, height });
    const outSamples  = await samplePixelsOutside(outputBuffer, { x, y, width, height });

    for (let i = 0; i < origSamples.length; i++) {
      const orig = origSamples[i];
      const out  = outSamples[i];
      if (
        Math.abs(orig.r - out.r) >= 3 ||
        Math.abs(orig.g - out.g) >= 3 ||
        Math.abs(orig.b - out.b) >= 3
      ) {
        return NextResponse.json(
          { error: "Integrity check failed: body photo modified outside placement zone" },
          { status: 500 }
        );
      }
    }

    // ── Return the composited JPEG ──────────────────────────────────────────
    return new NextResponse(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": 'attachment; filename="tattoo-tryOn.jpg"',
        "Cache-Control": "no-store",
        "X-Integrity-Check": `passed/${origSamples.length}-pixels`,
      },
    });

  } catch (err: unknown) {
    console.error("[try-on/composite]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Compositor failed" },
      { status: 500 }
    );
  }
}
