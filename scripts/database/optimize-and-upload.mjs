/**
 * optimize-and-upload.mjs
 *
 * Reads all images from "tattoo designs/", optimizes them to WebP (max 1600px wide, quality 80),
 * and uploads to the Supabase Storage "tattoos" bucket.
 *
 * Usage: node scripts/optimize-and-upload.mjs
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://smrnldmbvtflavzswghh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_5_ifCznMkVa9T4mmhoS3mg_NkzpdbUf';
const BUCKET = 'tattoos';
const SOURCE_DIR = path.resolve('tattoo designs');
const OPTIMIZED_DIR = path.resolve('tattoo designs/optimized');
const MAX_WIDTH = 1600;
const QUALITY = 80;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Supported image extensions
const SUPPORTED = ['.jpg', '.jpeg', '.png', '.webp'];

async function main() {
    // Create optimized output dir
    if (!fs.existsSync(OPTIMIZED_DIR)) {
        fs.mkdirSync(OPTIMIZED_DIR, { recursive: true });
    }

    const files = fs.readdirSync(SOURCE_DIR).filter(f => {
        const ext = path.extname(f).toLowerCase();
        return SUPPORTED.includes(ext) && !fs.statSync(path.join(SOURCE_DIR, f)).isDirectory();
    });

    console.log(`\n🖼  Found ${files.length} images to process\n`);

    const results = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const inputPath = path.join(SOURCE_DIR, file);
        const safeName = `design-${String(i + 1).padStart(2, '0')}.webp`;
        const outputPath = path.join(OPTIMIZED_DIR, safeName);

        try {
            // 1. Optimize with sharp
            const originalSize = fs.statSync(inputPath).size;
            const metadata = await sharp(inputPath).metadata();

            await sharp(inputPath)
                .resize({ width: MAX_WIDTH, withoutEnlargement: true })
                .webp({ quality: QUALITY })
                .toFile(outputPath);

            const optimizedSize = fs.statSync(outputPath).size;
            const savings = Math.round((1 - optimizedSize / originalSize) * 100);

            console.log(`[${i + 1}/${files.length}] ✅ ${file}`);
            console.log(`   ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(optimizedSize / 1024 / 1024).toFixed(2)}MB (${savings}% smaller)`);
            console.log(`   Dimensions: ${metadata.width}x${metadata.height}`);

            // 2. Upload to Supabase Storage
            const fileBuffer = fs.readFileSync(outputPath);
            const storagePath = `designs/${safeName}`;

            const { data, error } = await supabase.storage
                .from(BUCKET)
                .upload(storagePath, fileBuffer, {
                    contentType: 'image/webp',
                    upsert: true,
                });

            if (error) {
                console.log(`   ❌ Upload failed: ${error.message}`);
            } else {
                const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
                console.log(`   📤 Uploaded: ${urlData.publicUrl}`);
                results.push({
                    name: safeName,
                    originalFile: file,
                    url: urlData.publicUrl,
                    width: metadata.width > MAX_WIDTH ? MAX_WIDTH : metadata.width,
                    height: metadata.width > MAX_WIDTH
                        ? Math.round(metadata.height * (MAX_WIDTH / metadata.width))
                        : metadata.height,
                });
            }

        } catch (err) {
            console.log(`[${i + 1}/${files.length}] ❌ SKIPPED ${file}: ${err.message}`);
        }

        console.log('');
    }

    // 3. Write manifest
    const manifestPath = path.resolve('tattoo designs/manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(results, null, 2));
    console.log(`\n📋 Manifest saved: ${manifestPath}`);
    console.log(`✅ Done! ${results.length}/${files.length} images uploaded to Supabase.\n`);
}

main().catch(console.error);
