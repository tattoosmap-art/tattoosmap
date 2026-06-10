import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { encode } from 'blurhash';

// Security configurations
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit

// In-Memory Rate Limiter (Basic implementation for VPS without Edge store)
// Note: In a multi-server setup, map to Redis caching layer instead.
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function POST(request: Request) {
    try {
        // --- Gate 1: Rate Limiting ---
        const ip = request.headers.get('x-forwarded-for') || 'anonymous_ip';
        const now = Date.now();
        const rateData = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

        if (now > rateData.resetTime) {
            rateData.count = 1;
            rateData.resetTime = now + RATE_LIMIT_WINDOW_MS;
        } else {
            rateData.count += 1;
        }
        rateLimitMap.set(ip, rateData);

        if (rateData.count > MAX_REQUESTS_PER_WINDOW) {
            return NextResponse.json({ error: 'Too many upload requests.' }, { status: 429 });
        }

        // --- Extract Payload ---
        const formData = await request.formData();
        const type = formData.get('type') as string || 'internal';
        const url = formData.get('url') as string | null;
        const file = formData.get('image') as File | null;

        // --- Hybrid Branch: EXTERNAL (URLs from Pinterest/Insta) ---
        if (type === 'external') {
            if (!url) return NextResponse.json({ error: 'No URL provided for external upload.' }, { status: 400 });

            const res = await fetch(url);
            if (!res.ok) return NextResponse.json({ error: 'Failed to securely fetch external image URL' }, { status: 400 });

            const buffer = Buffer.from(await res.arrayBuffer());
            const externalChain = sharp(buffer);
            const metadata = await externalChain.metadata();

            const rawForBlurhash = await externalChain.clone().resize(32, 32, { fit: 'inside' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
            const blurHashString = encode(new Uint8ClampedArray(rawForBlurhash.data), rawForBlurhash.info.width, rawForBlurhash.info.height, 4, 4);

            return NextResponse.json({
                success: true,
                data: { blurhash: blurHashString, width: metadata.width, height: metadata.height, urls: { original: url } }
            });
        }

        // --- Hybrid Branch: INTERNAL ---
        if (!file) {
            return NextResponse.json({ error: 'No image uploaded for internal processing.' }, { status: 400 });
        }

        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, and WEBP allowed.' }, { status: 415 });
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            return NextResponse.json({ error: 'Payload too large. Maximum size is 5MB.' }, { status: 413 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Process image using sharp
        let processingChain = sharp(buffer);
        const metadata = await processingChain.metadata();

        // Target: Add 15% opacity text watermark to bottom right
        const svgWatermark = `
            <svg width="${metadata.width || 1200}" height="${metadata.height || 1200}">
                <style>
                .title { fill: rgba(255, 255, 255, 0.15); font-size: 32px; font-weight: bold; font-family: "DM Sans", sans-serif; text-anchor: end; letter-spacing: 0.1em; }
                </style>
                <text x="${(metadata.width || 1200) - 40}" y="${(metadata.height || 1200) - 40}" class="title">TATTOOSMAP</text>
            </svg>
        `;

        processingChain = processingChain.composite([{
            input: Buffer.from(svgWatermark),
            gravity: 'southeast',
        }]);

        // Generate different sizes
        const sizes = {
            thumbnail: await processingChain.clone().resize({ width: 400 }).webp({ quality: 82 }).toBuffer(),
            medium: await processingChain.clone().resize({ width: 800 }).webp({ quality: 82 }).toBuffer(),
            large: await processingChain.clone().resize({ width: 1200 }).webp({ quality: 82 }).toBuffer(),
        };

        // Generate BlurHash
        const rawForBlurhash = await processingChain
            .clone()
            .resize(32, 32, { fit: 'inside' })
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        const blurHashString = encode(
            new Uint8ClampedArray(rawForBlurhash.data),
            rawForBlurhash.info.width,
            rawForBlurhash.info.height,
            4, 4
        );

        return NextResponse.json({
            success: true,
            data: {
                blurhash: blurHashString,
                width: metadata.width,
                height: metadata.height,
                // Mock URLs assume Supabase .upload() hook fired successfully
                urls: {
                    original: 'url_to_original',
                    large: 'url_to_internal_large.webp',
                    medium: 'url_to_internal_medium.webp',
                    thumbnail: 'url_to_internal_thumbnail.webp',
                }
            }
        });

    } catch (error) {
        console.error('Upload processing failed:', error);
        return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
    }
}
