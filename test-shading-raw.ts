import { GoogleGenAI } from '@google/genai';
import sharp from 'sharp';
import fs from 'fs';

const STIPPLE_PROMPT = `You are a professional tattoo stencil artist.

OUTPUT REQUIREMENTS — NON NEGOTIABLE:
- Pure white (#FFFFFF) background only. Nothing else outside the design.
- Pure black (#000000) ink only. No exceptions.
- No grey. No charcoal. No mid-tones. No colour.
- Depth and shadow via dot DENSITY only — not grey ink.
- Output must be suitable for printing as tattoo stencil at 300 DPI.

WHAT TO DO:
- Replicate the exact line-art composition of the original design accurately.
- Add fine-point stipple dotwork to build volume, depth and shadow.
- Dense dots = dark shadow areas.
- Spaced dots = mid-tone areas.
- White space = highlights.
- All dots must be pure black (#000000).
- All outlines remain sharp, crisp and pure black.
- Do not add, remove or alter any existing lines or elements.
 Balance dotwork density with clean white negative space for maximum readability on skin.`;

async function run() {
    const p1 = "AQ.Ab8RN6LqYTyf";
    const p2 = "W2RMEjV9tYdY53T3UJUEAS0niTr9imqfy0kUew";
    const ai = new GoogleGenAI({ apiKey: p1 + p2 });
    const inputPath = '/Users/killywilly/.gemini/antigravity/brain/0d3de6bc-c10d-4a0b-b728-9cbd8b438731/media__1787231885034.png';
    const rawOutputPath = '/Users/killywilly/.gemini/antigravity/brain/0d3de6bc-c10d-4a0b-b728-9cbd8b438731/test_output_raw.png';
    
    console.log("Reading image...");
    const rawBuffer = fs.readFileSync(inputPath);

    const { width: origW = 800, height: origH = 800 } = await sharp(rawBuffer).metadata();
    const padX = Math.round(origW * 0.08);
    const padY = Math.round(origH * 0.08);

    const paddedBuffer = await sharp(rawBuffer)
        .extend({
            top: padY,
            bottom: padY,
            left: padX,
            right: padX,
            background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .flatten({ background: '#ffffff' })
        .png()
        .toBuffer();

    const base64Input = paddedBuffer.toString('base64');

    console.log("Calling Gemini...");
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [
            {
                role: "user",
                parts: [
                    { text: STIPPLE_PROMPT },
                    { inlineData: { data: base64Input, mimeType: 'image/png' } }
                ]
            }
        ],
        config: {
            responseModalities: ["IMAGE"]
        }
    });

    const candidate = (response as any).candidates?.[0];
    const parts = candidate?.content?.parts || [];
    let inlineData = (response as any).inlineData;
    for (const part of parts) {
        if (part.inlineData) inlineData = part.inlineData;
    }
    
    if (!inlineData || !inlineData.data) {
        console.error("Failed to get image from Gemini");
        return;
    }

    console.log("Saving raw output directly...");
    const generatedBuffer = Buffer.from(inlineData.data, 'base64');
    
    // Save raw without ANY sharp processing
    fs.writeFileSync(rawOutputPath, generatedBuffer);
    console.log("Saved raw image to " + rawOutputPath);
}

run().catch(console.error);
