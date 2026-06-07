import sharp from "sharp";

async function run() {
    try {
        const rw = 100, rh = 100;
        
        // Mock a 3-channel (RGB) image (e.g. uploaded JPEG)
        const rgbBuffer = await sharp({
            create: {
                width: rw,
                height: rh,
                channels: 3,
                background: { r: 255, g: 255, b: 255 }
            }
        }).png().toBuffer();

        // Simulate inkMask generation WITH ensureAlpha
        const inkMask = await sharp(rgbBuffer).grayscale().negate().ensureAlpha().toBuffer();
        
        // Generate noiseBuffer (with ensureAlpha -> 4 channels)
        const noiseData = Buffer.alloc(rw * rh, 128);
        const noiseBuffer = await sharp(noiseData, { raw: { width: rw, height: rh, channels: 1 } })
            .ensureAlpha()
            .png()
            .toBuffer();

        // This will now WORK
        await sharp(inkMask).boolean(noiseBuffer, 'and').toBuffer();
        console.log("Success!");
    } catch (e) {
        console.error("Error:", e);
    }
}
run();
