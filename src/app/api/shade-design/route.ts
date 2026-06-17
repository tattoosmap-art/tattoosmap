import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import sharp from 'sharp';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const STIPPLE_PROMPT = "CRITICAL OUTPUT RULE: Output ONLY a single tattoo design centred on a solid 100% pure white background. Do NOT include any extra sketches, scribbles, draft lines, reference panels, watermarks, borders, frames, multiple design variants, or any other mark outside the single design. The entire canvas outside the design must be completely empty pure white (#FFFFFF) with absolutely nothing else on it. Hard constraint: Replicate the precise line-art composition of the original design with absolute accuracy; do not add, remove, or alter any existing lines. Apply detailed fine-point dotwork stippling across the design to build volume, gradients, and shadows. Create soft, realistic internal shadows using fine dotwork to build depth. The final output must look like a realistic charcoal-grey tattoo ink illustration. All main external outlines must remain sharp, distinct, and crisp. Background must be 100% solid pure white with zero texture, noise, shadow, or margin — nothing else.";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        
        if (!file) return NextResponse.json({ error: 'No image provided' }, { status: 400 });
 
        const rawBuffer = Buffer.from(new Uint8Array(await file.arrayBuffer()));

        // Add ~8% white padding on all sides so Gemini never clips edge elements.
        // This gives the model room to complete any part of the design that touches the border.
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
                responseModalities: ["IMAGE"],
                safetySettings: [
                    {
                        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
                    }
                ]
            }
        });
 
        const responseData = response as any;
        const candidate = responseData.candidates?.[0];
        const parts = candidate?.content?.parts || [];
        
        let inlineData = responseData.inlineData;
        let textResponse = "";
        
        for (const part of parts) {
            if (part.inlineData) {
                inlineData = part.inlineData;
            }
            if (part.text) {
                textResponse += part.text;
            }
        }
 
        if (!inlineData || !inlineData.data) {
            console.error("Gemini Response without image data:", JSON.stringify(responseData, null, 2));
            
            if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
                throw new Error(`Gemini generation stopped. Reason: ${candidate.finishReason}`);
            }
            if (textResponse.trim()) {
                throw new Error(`Gemini response: ${textResponse.trim()}`);
            }
            throw new Error("No image data returned from Gemini");
        }
 
        const generatedBase64 = inlineData.data;
 
        // Post-process with Sharp to ensure web optimization and strict white background
        const generatedBuffer = Buffer.from(generatedBase64, 'base64');
        const optimizedBuffer = await sharp(generatedBuffer)
            .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
            .flatten({ background: '#ffffff' })
            .modulate({ brightness: 1.05 })
            .linear(1.15, -20)
            .toColorspace('srgb')
            .webp({ quality: 90 })
            .toBuffer();

        return NextResponse.json({
            shaded_base64: optimizedBuffer.toString('base64'),
            success: true
        });

    } catch (err: any) {
        console.error("Shade design error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
