import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generate() {
    const width = 1500;
    const height = 1500;
    
    // Create an SVG with very minimal geometry to ensure mean brightness > 235
    const svgImage = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white"/>
      <circle cx="750" cy="750" r="500" fill="none" stroke="black" stroke-width="15"/>
      <path d="M 750 250 L 750 1250" stroke="black" stroke-width="8"/>
    </svg>`;

    // Save as uncompressed PNG to ensure it exceeds 50KB
    const buffer = await sharp(Buffer.from(svgImage))
        .png({ compressionLevel: 0 }) 
        .toBuffer();

    const outPath = path.join(process.cwd(), 'test-design.png');
    fs.writeFileSync(outPath, buffer);
    
    // Verify the pixel stats
    const stats = await sharp(buffer).stats();
    console.log("Mean pixel value: ", stats.channels[0].mean);
    console.log(`Generated test-design.png at ${outPath}. Size: ${(buffer.length / 1024).toFixed(2)} KB`);
}

generate().catch(console.error);
