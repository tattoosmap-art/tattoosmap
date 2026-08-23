import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import sharp from 'sharp';
import { analyzeDermographicScore } from '@/lib/dermographic-scorer';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

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
  const SHADE_ONLY_PROMPT = `You are a master tattoo stencil artist with 20 years of professional dotwork experience. Your output will be printed directly onto thermal stencil transfer paper and transferred to human skin. Every decision must respect the biological physics of ink longevity and thermal printer requirements.

ABSOLUTE OUTPUT CONTRACT — VIOLATION = UNUSABLE:
1. Output is pure 1-bit: ONLY #000000 black and #FFFFFF white. Zero grey. Zero anti-aliasing. If you zoom to 800% every dot must be a solid geometric black shape with no soft edges.
2. The background canvas must be 100% pure white with absolutely nothing outside the design boundary. NO borders. NO frames. NO decorative edges. NO corner marks. NO watermarks. NO boxes around the design. The design floats on pure white with nothing else.
3. Every master outline in the original must be preserved exactly — same position, same weight, same shape. Do not alter, move, add or remove any line or element.
4. Leave a clear white separation gap around every outline before shading begins. Shading dots must NEVER touch or overlap the master outlines. A clean white halo must surround every line.
5. Faces, text, and fine detail areas must remain visibly lighter than primary shadow regions — never over-shade delicate features.

SHADING ARCHITECTURE — FOUR DISCRETE TONAL STEPS ONLY:
Build ALL depth and shadow using exactly four dot density levels. Never blend continuously between them — each zone must be clearly distinct:

STEP 1 — PURE WHITE (0% fill): All highlight areas and background. No marks whatsoever. Leave generous white space — aim for 60-70% of the total design area being pure white.

STEP 2 — HIGHLIGHT SHADOW (20% fill): Very sparse dots spaced far apart. The first hint of form and volume. Used on surfaces facing toward the light source.

STEP 3 — MID-TONE (50% fill): Dots spaced 1-2 dot-widths apart. The main body surface tone. Used on surfaces perpendicular to the light source.

STEP 4 — DEEP SHADOW (80-100% fill): Dense touching dots transitioning to solid black fill. Used in deepest recesses — eye sockets, under coils, inside curves, where light cannot reach. The very darkest areas use 100% solid black fill with no dots — pure carbon mass.

TRANSITION RULE: Move gradually between steps across the form. The sequence is always: SOLID BLACK → DENSE DOTS → SPACED DOTS → SPARSE DOTS → WHITE SPACE. Never jump from solid black directly to white. Each transition zone should span at least 3-5mm in the final design.

DOTWORK PHYSICS — WHY THIS MATTERS:
Continuous grey tones and washes are absorbed by skin melanin over time and disappear. Only discrete dense carbon-black deposits survive long-term in all skin tones. Tonal values below 20% fade to invisible within 5 years. This is why every shadow must be built from solid black dots — never grey ink.

LINE WEIGHT HIERARCHY:
- Outer silhouette/contours: boldest strokes (visually heaviest)
- Internal structure lines: medium weight
- Fine interior details: thinnest strokes (minimum visible weight)
This hierarchy must be visible and deliberate in the output.

STENCIL PRODUCTION REQUIREMENT:
The output must transfer cleanly when photocopied at high contrast. If any area loses structural integrity at high contrast photocopy — it is wrong. The design must be readable from 3 feet away with no detail lost.

BLACKWORK ENHANCEMENTS:
→ Fill large black areas with geometric micro-pattern
→ Add bold shadow lines on one side of all elements
→ Strengthen main outline to 2x weight of detail lines
→ Use bold black fills contrasted with pure white negative space

HALLUCINATION PREVENTION — STRICTLY FORBIDDEN:
- Do NOT add a dotted "cut-out" line or scissor boundary around the design
- Do NOT add any border, frame, box, or decorative edge around the design
- Do NOT add any lines that were not in the original input
- Do NOT add background textures or patterns
- Do NOT add corner marks or registration marks
- Do NOT add any element outside the original design boundary
- The output contains ONLY what was in the input — shaded with dots`;

  const REDRAW_PROMPT = `You are a master tattoo artist redrawing a rough client concept sketch into a production-ready professional stencil. Every line you draw will be transferred to human skin via thermal stencil paper.

ABSOLUTE OUTPUT CONTRACT — VIOLATION = UNUSABLE:
1. Pure 1-bit output only: #000000 black and #FFFFFF white. No grey. No anti-aliasing. Every mark must be a solid geometric shape at 800% zoom.
2. Pure white background with zero stray pixels outside the design boundary.
3. Preserve the original concept subject, composition, and layout. Change the execution quality — not the design concept.
4. Clear white separation gap around every outline — shading never touches linework.
5. Delicate features (faces, text, fine detail) always lighter than primary shadow zones.

REDRAW EXECUTION:
- Redraw every wobbly line as a smooth, confident stroke
- Fix imperfect geometry — perfect circles, exact symmetry
- Make organic shapes elegant — curved petals, smooth muscle lines
- Apply deliberate line weight variation: bold outer contours, medium internal structure, fine detail lines
- Remove any hairline or sub-pixel lines — redraw at proper tattooable weight

FOUR-STEP TONAL ARCHITECTURE:
STEP 1 — PURE WHITE (0%): Highlights and background. 60-70% of total area.
STEP 2 — HIGHLIGHT (20%): Sparse far-apart dots. Surfaces facing light.
STEP 3 — MID-TONE (50%): Dots 1-2 widths apart. Main body surface.
STEP 4 — DEEP SHADOW (80-100%): Dense touching dots into solid black. Deepest recesses.

TRANSITION: Always gradual. Solid black → dense → spaced → sparse → white. Minimum 3-5mm per transition zone. Never abrupt jumps.

LINE WEIGHT HIERARCHY: Bold outer silhouette → medium internal structure → fine interior details. This hierarchy must be immediately visible.

PHYSICS: Tonal values below 20% are absorbed by skin melanin and disappear within years. Build ALL depth from discrete pure-black dots — never grey ink. Only carbon-black deposits survive long-term in all skin tones globally.

OUTPUT STANDARD: Transferable via thermal stencil printer. Readable at 3 feet. Survives high-contrast photocopy. A professional tattoo artist accepts it with zero modifications.`;

  if (mode === 'shade') {
    return SHADE_ONLY_PROMPT;
  }

  const basePrompt = REDRAW_PROMPT;

  const styleEnhancements: Record<string, string> = {
    'fine-line': `
FINE LINE ENHANCEMENTS:
→ Add subtle dotwork shadow beneath each element
→ Add small accent dots at all line endpoints and curves
→ Ensure all lines minimum 0.3mm at final tattoo size
→ Add delicate stippled texture to fill areas
→ Clean all negative space to pure white
`,
    'blackwork': `
BLACKWORK ENHANCEMENTS:
→ Fill large black areas with geometric micro-pattern
→ Add bold shadow lines on one side of all elements
→ Strengthen main outline to 2x weight of detail lines
→ Use bold black fills contrasted with pure white negative space
`,
    'traditional': `
TRADITIONAL ENHANCEMENTS:
→ Thicken all outlines to classic American traditional weight
→ Add bold shadow lines below and right of all elements
→ Convert any gradient to solid black or white — no grey
→ Add classic bold frame or banner if design permits
→ Simplify all detail to bold clear shapes
`,
    'neo-traditional': `
NEO-TRADITIONAL ENHANCEMENTS:
→ Add ornate botanical or floral frame elements
→ Vary line weights dramatically — bold outline, fine detail
→ Add decorative dotwork texture to background areas
→ Include decorative flourishes at natural endpoints
`,
    'default': `
UNIVERSAL ENHANCEMENTS:
→ Add dotwork stippling for all shadow areas
→ Thicken main outlines by 15% over detail lines
→ Add accent dots at line intersections
→ Clean all negative space to pure white
→ Ensure no element is closer than 1mm to another
`
  };

  const issueCorrections = issues.map(issue => {
    if (issue.includes('thin')) return '→ PRIORITY: Thicken all lines to minimum tattooable weight';
    if (issue.includes('detail')) return '→ PRIORITY: Simplify crowded areas — remove smallest details';
    if (issue.includes('close')) return '→ PRIORITY: Add breathing space between touching elements';
    if (issue.includes('grey')) return '→ PRIORITY: Convert all grey to pure black dotwork';
    return `→ FIX: ${issue}`;
  }).join('\n');

  const enhancement = styleEnhancements[style] || styleEnhancements['default'];

  return `${basePrompt}\n\n${enhancement}\n${issueCorrections ? 'SPECIFIC FIXES REQUIRED:\n' + issueCorrections : ''}`;
};

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        
        const detectedStyle = (formData.get('style') as string) || 'default';
        const issuesRaw = formData.get('issues') as string;
        const mode = formData.get('mode') as string || 'shade';
        const isPolished = formData.get('isPolished') as string === 'true';

        let detectedIssues: string[] = [];
        try {
            if (issuesRaw) detectedIssues = JSON.parse(issuesRaw);
        } catch(e) {
            if (issuesRaw) detectedIssues = issuesRaw.split(',');
        }
        const STIPPLE_PROMPT = getShadePrompt(detectedStyle, detectedIssues, mode);
        
        if (!file) return NextResponse.json({ error: 'No image provided' }, { status: 400 });
 
        const rawBuffer = Buffer.from(new Uint8Array(await file.arrayBuffer()));

        const meta = await sharp(rawBuffer).metadata();
        const minDimension = Math.min(meta.width || 0, meta.height || 0);

        let baseS = sharp(rawBuffer).trim();
        if (minDimension < 1200) {
            baseS = baseS.resize({ width: 1200, height: 1200, fit: 'inside', kernel: 'lanczos3', withoutEnlargement: false });
        } else {
            baseS = baseS.resize({ width: 1200, height: 1200, fit: 'inside', kernel: 'lanczos3' });
        }

        let preprocessedBuffer: Buffer;
        if (isPolished) {
            preprocessedBuffer = await baseS.flatten({ background: '#ffffff' }).grayscale().png({ quality: 100 }).toBuffer();
        } else {
            preprocessedBuffer = await baseS.flatten({ background: '#ffffff' }).grayscale().median(2).clahe({ width: 64, height: 64, maxSlope: 3 }).normalise().linear(1.3, -15).png({ quality: 100 }).toBuffer();
        }

        const hardProcessed = await sharp(preprocessedBuffer).linear(1.2, -30).median(2).linear(3, -200).threshold(128).png().toBuffer();
        const preCheck = await analyzeDermographicScore(hardProcessed);



        const { width: origW = 1200, height: origH = 1200 } = await sharp(preprocessedBuffer).metadata();
        const padX = Math.round(origW * 0.08);
        const padY = Math.round(origH * 0.08);

        const paddedBuffer = await sharp(preprocessedBuffer).extend({ top: padY, bottom: padY, left: padX, right: padX, background: { r: 255, g: 255, b: 255 } }).png().toBuffer();
        const imageBase64 = paddedBuffer.toString('base64');

        let responseData: any = null;
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount <= maxRetries) {
            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: [
                        { role: "user", parts: [{ text: STIPPLE_PROMPT }, { inlineData: { mimeType: 'image/png', data: imageBase64 } }] }
                    ],
                    config: {
                        responseModalities: ["IMAGE"],
                        safetySettings: [
                            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH }
                        ]
                    }
                });
                responseData = response as any;
                break;
            } catch (err: any) {
                retryCount++;
                if (retryCount > maxRetries) throw err;
                await new Promise(r => setTimeout(r, 2000 * retryCount));
            }
        }

        const candidate = responseData.candidates?.[0];
        const part = candidate?.content?.parts?.find((p: any) => p.inlineData);
        
        if (!part) throw new Error("No image data returned from Gemini");
 
        const generatedBase64 = part.inlineData.data;
        const generatedBuffer = Buffer.from(generatedBase64, 'base64');
 
        const optimizedBuffer = await sharp(generatedBuffer)
            .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
            .png({ compressionLevel: 8 })
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
