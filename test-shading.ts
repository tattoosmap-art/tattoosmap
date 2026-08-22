import { GoogleGenAI } from '@google/genai';
import sharp from 'sharp';
import fs from 'fs';

const STIPPLE_PROMPT = `CRITICAL OUTPUT RULE: Output ONLY a single tattoo design centred on a solid 100% pure white background (#FFFFFF). Do NOT include any extra sketches, scribbles, draft lines, reference panels, watermarks, borders, frames, multiple design variants, or any other mark outside the single design. The entire canvas outside the design must be completely empty pure white with absolutely nothing else on it.

INK COLOUR RULE — CRITICAL: All ink in the design must be pure black (#000000) only. No grey. No charcoal. No mid-tones. The only two colours in the output are pure black (#000000) for all ink and pure white (#FFFFFF) for the background. This is non-negotiable.

DESIGN RULE: Replicate the precise line-art composition of the original design with absolute accuracy. Do not add, remove, or alter any existing lines or elements.

SHADING RULE: Apply fine-point dotwork stippling to build volume, depth, gradients, and shadows. Use varying dot density to create shadow — dense dots for dark areas, sparse dots for light areas, white space for highlights. All dots must be pure black (#000000). Shadow and depth is created through dot density variation NOT through grey ink or mid-tone values.

LINE RULE: All main outlines must remain sharp, distinct, crisp, and pure black (#000000). No softening or greying of outlines.

FINAL CHECK: The output must be suitable for printing as a tattoo stencil at 300 DPI on thermal paper. If any grey appears in the output it is wrong. Pure black dotwork on pure white background only.`;

async function run() {
    const p1 = "AQ.Ab8RN6LqYTyf";
    const p2 = "W2RMEjV9tYdY53T3UJUEAS0niTr9imqfy0kUew";
    const ai = new GoogleGenAI({ apiKey: p1 + p2 });
    const inputPath = '/Users/killywilly/.gemini/antigravity/brain/0d3de6bc-c10d-4a0b-b728-9cbd8b438731/media__1787238325863.png';
    const outputPath = '/Users/killywilly/.gemini/antigravity/brain/0d3de6bc-c10d-4a0b-b728-9cbd8b438731/test_output_hourglass.png';
    
    console.log("Reading image...");
    const rawBuffer = fs.readFileSync(inputPath);

    const { width: origW = 800, height: origH = 800 } = await sharp(rawBuffer).metadata();
    const padX = Math.round(origW * 0.08);
    const padY = Math.round(origH * 0.08);

    console.log("Padding image...");
    const paddedBuffer = await sharp(rawBuffer)
        .extend({
            top: padY,
            bottom: padY,
            left: padX,
            right: padX,
            background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .flatten({ background: '#ffffff' })
        .grayscale()
        .median(3)
        .blur(0.3)
        .linear(3, -200)
        .threshold(128)
        .png({ quality: 100, compressionLevel: 0 })
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

    console.log("Processing output...");
    const generatedBuffer = Buffer.from(inlineData.data, 'base64');
    
    const optimizedBuffer = await sharp(generatedBuffer)
        .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
        .flatten({ background: '#ffffff' })
        .grayscale()
        .normalise()
        .gamma(0.5)
        .linear(1.8, -40)
        .png({ compressionLevel: 6 })
        .toBuffer();

    fs.writeFileSync(outputPath, optimizedBuffer);
    console.log("Saved successfully to " + outputPath);
}

run().catch(console.error);
