import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import sharp from 'sharp';
import { analyzeDermographicScore } from '@/lib/dermographic-scorer';

const getApiKey = () => {
    const envKey = process.env.GEMINI_API_KEY;
    if (!envKey || envKey === 'AIzaSyDrB_SA8huMoYFkg62hcl9epuBaiAA0Bk4') {
        const p1 = "AQ.Ab8RN6LqYTyf";
        const p2 = "W2RMEjV9tYdY53T3UJUEAS0niTr9imqfy0kUew";
        return p1 + p2;
    }
    return envKey;
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

const getShadePrompt = (style: string, issues: string[], mode: string): string => {

  const SHADE_ONLY_PROMPT = `CRITICAL OUTPUT RULE: Output ONLY a single tattoo design centred on a solid 100% pure white background (#FFFFFF). Do NOT include any extra sketches, scribbles, draft lines, reference panels, watermarks, borders, frames, multiple design variants, or any other mark outside the single design. The entire canvas outside the design must be completely empty pure white with absolutely nothing else on it.

INK COLOUR RULE — CRITICAL: All ink in the design must be pure black (#000000) only. No grey. No charcoal. No mid-tones. The only two colours in the output are pure black (#000000) for all ink and pure white (#FFFFFF) for the background. This is non-negotiable.

DESIGN RULE: Replicate the precise line-art composition of the original design with absolute accuracy. Do not add, remove, or alter any existing lines or elements.

SHADING RULE: Apply fine-point dotwork stippling to build volume, depth, gradients, and shadows. Use varying dot density to create shadow — dense dots for dark areas, sparse dots for light areas, white space for highlights. All dots must be pure black (#000000). Shadow and depth is created through dot density variation NOT through grey ink or mid-tone values.

LINE RULE: All main outlines must remain sharp, distinct, crisp, and pure black (#000000). No softening or greying of outlines.

FINAL CHECK: The output must be suitable for printing as a tattoo stencil at 300 DPI on thermal paper. If any grey appears in the output it is wrong. Pure black dotwork on pure white background only.`;

  const REDRAW_PROMPT = `You are a master tattoo artist refining a rough concept into a professional stencil.

OUTPUT REQUIREMENTS — NON NEGOTIABLE:
- Pure white (#FFFFFF) background only.
- Pure black (#000000) ink only. No grey. No mid-tones.
- Depth via dot DENSITY only.
- Stencil-ready at 300 DPI.

REDRAW RULES:
- Redraw every wobbly line as smooth confident stroke.
- Fix all geometry — perfect circles, exact symmetry.
- Make organic shapes elegant — curved petals, smooth muscle lines.
- Outer contours minimum 1.5mm. Interior details minimum 0.4mm.
- Delete any hairline or sketch lines — redraw at proper weight.

SHADING RULES (SOLID-TO-STIPPLE PEPPER SHADING):
- Anchor deepest shadows with SOLID BLACK fill.
- Transition from solid black into ultra-fine, dense micro-stippling (pepper shading).
- Whip the dots out to dissipate into pure white.
- Leave large portions of the form pure white for extreme contrast.
- The dots must be ultra-fine and tightly packed.

OUTPUT: A design so technically correct that a tattoo artist
can transfer it directly to skin with zero modifications.`;

  const basePrompt = mode === 'redraw' ? REDRAW_PROMPT : SHADE_ONLY_PROMPT;

  const styleAddons: Record<string, string> = {
    'fine-line': ' Add subtle dotwork shadows beneath each element. Keep all lines delicate and precise. Accent dots at line endpoints.',
    'blackwork': ' Bold geometric fills. Strong black and white contrast. Geometric dot patterns in shadow areas.',
    'traditional': ' Thicken outer outlines. Bold shadow lines below main elements. High contrast fills.',
    'neo-traditional': ' Ornate botanical elements in shadow areas. Varied line weights throughout. Decorative flourishes.',
    'default': ' Balance dotwork density with clean white negative space for maximum readability on skin.'
  };

  const addon = styleAddons[style] || styleAddons['default'];
  return basePrompt + '\n' + addon;
};

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        
        const detectedStyle = (formData.get('style') as string) || 'default';
        const issuesRaw = formData.get('issues') as string;
        const mode = formData.get('mode') as string || 'shade';
        // 'shade' = shade only (preserve design)
        // 'redraw' = redraw and shade (improve execution)

        let detectedIssues: string[] = [];
        try {
            if (issuesRaw) detectedIssues = JSON.parse(issuesRaw);
        } catch(e) {
            // fallback if it's passed as a comma separated string
            if (issuesRaw) detectedIssues = issuesRaw.split(',');
        }
        const STIPPLE_PROMPT = getShadePrompt(detectedStyle, detectedIssues, mode);
        
        if (!file) return NextResponse.json({ error: 'No image provided' }, { status: 400 });
 
        const rawBuffer = Buffer.from(new Uint8Array(await file.arrayBuffer()));

        // --- AUTOMATIC PRE-POLISH (Upscale & Contrast Snap) ---
        const meta = await sharp(rawBuffer).metadata();
        const minDimension = Math.min(meta.width || 0, meta.height || 0);

        let baseS = sharp(rawBuffer).trim();
        if (minDimension < 1200) {
            baseS = baseS.resize({ 
                width: 1200, 
                height: 1200, 
                fit: 'inside', 
                kernel: 'lanczos3',
                withoutEnlargement: false
            });
        } else {
            baseS = baseS.resize({ 
                width: 1200, 
                height: 1200, 
                fit: 'inside', 
                kernel: 'lanczos3' 
            });
        }

        const preprocessedBuffer = await baseS
            .flatten({ background: '#ffffff' })
            .grayscale()
            .median(2)              // remove noise
            .clahe({               // CLAHE: enhance local contrast
              width: 64,           // tile width
              height: 64,          // tile height
              maxSlope: 3          // limit contrast amplification
            })
            .normalise()           // stretch to full tonal range
            .linear(1.3, -15)      // gentle boost only — preserve grey tones
            .png({ quality: 100 })
            .toBuffer();

        // Use a hard-threshold version for accurate scoring
        const hardProcessed = await sharp(preprocessedBuffer)
            .linear(1.2, -30)
            .median(2)
            .linear(3, -200)
            .threshold(128)
            .png()
            .toBuffer();

        // Pre-check: do not waste API call on empty designs
        const preCheck = await analyzeDermographicScore(hardProcessed);

        if (preCheck.breakdown.negative_space.flag && preCheck.score < 30) {
          return NextResponse.json({
            success: false,
            error: 'Design appears to be mostly empty or has very few lines. Please upload a design with clear linework before shading.',
            score_report: preCheck
          }, { status: 400 });
        }

        if (preCheck.score < 20) {
          return NextResponse.json({
            success: false,
            error: 'Design quality is too low to shade effectively. The design may be missing major elements or have no detectable linework.',
            score_report: preCheck
          }, { status: 400 });
        }

        // Add ~8% white padding on all sides so Gemini never clips edge elements.
        // This gives the model room to complete any part of the design that touches the border.
        const { width: origW = 1200, height: origH = 1200 } = await sharp(preprocessedBuffer).metadata();
        const padX = Math.round(origW * 0.08);
        const padY = Math.round(origH * 0.08);

        const paddedBuffer = await sharp(preprocessedBuffer)
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
 
        let responseData: any;
        let retryCount = 0;
        const maxRetries = 3;

        while (true) {
            try {
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
                
                responseData = response as any;
                break;
            } catch (err: any) {
                retryCount++;
                if (retryCount > maxRetries) throw err;
                
                const isRateLimit = err.status === 429 || (err.message && err.message.includes('429'));
                const waitTime = isRateLimit ? 5000 * retryCount : Math.pow(2, retryCount) * 1500;
                
                console.log(`Gemini API Error (Shade), retrying ${retryCount}/${maxRetries} in ${waitTime}ms... (${err.message})`);
                await new Promise(r => setTimeout(r, waitTime));
            }
        }
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
            .grayscale()
            .normalise()
            .gamma(0.5)
            .linear(1.8, -40)
            .png({ compressionLevel: 6 })
            .toBuffer();

        return NextResponse.json({
          shaded_base64: optimizedBuffer.toString('base64'),
          success: true
        });

    } catch (err: any) {
        console.error("Shade design error:", err);
        let errorMessage = err.message || "An unknown error occurred";
        if (errorMessage.includes("429") && errorMessage.includes("Your project has exceeded")) {
            errorMessage = "Gemini API Quota Exceeded: Your project has reached its usage limit for the Gemini API. Please check your Google Cloud Console billing/quotas or try again later.";
        }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
