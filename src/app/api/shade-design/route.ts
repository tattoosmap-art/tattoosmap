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
  const baseRule = `
CRITICAL OUTPUT RULE: Output ONLY a single tattoo design 
on pure white (#FFFFFF) background. Pure black (#000000) 
ink only. No grey. No mid-tones. Stencil-ready at 300 DPI.

INK RULE: Two colours only — #000000 and #FFFFFF.
Depth and shadow via dot DENSITY not grey ink.
Dense dots = dark. Sparse dots = light. White = highlight.
`;

const SHADE_ONLY_RULE = `
PRESERVATION RULE: Keep the original design composition 
and execution exactly as intended by the artist.
Fix only: line weight inconsistency, grey values to black,
spacing issues, and add dotwork shadows.
Do NOT change any lines, shapes, or elements.
`;

const REDRAW_RULE = `
MASTER REDRAW RULE: Treat the input as a rough concept 
sketch from a client. You have full creative freedom to 
redraw every line with professional tattoo artist skill.

FIX AGGRESSIVELY:
→ All wobbly or unconfident lines → smooth sweeping strokes
→ Imperfect geometry → perfect symmetry and crisp angles
→ Amateur organic shapes → elegant professional versions
→ Inconsistent line weight → thick outlines, fine details
→ Rough textures → clean pure linework

KEEP:
→ The overall subject and what is depicted
→ The general composition and layout
→ The relative positions of elements

OUTPUT: A design so clean and professional that
a tattoo artist could transfer it directly to skin.
`;

const activeRule = mode === 'redraw' ? REDRAW_RULE : SHADE_ONLY_RULE;

const elementRules = `
ELEMENT-SPECIFIC RULES:
→ Flowers and leaves: organic, elegantly curved petals,
  dynamically layered, never flat outlines
→ Animals: confident anatomy, smooth muscle lines,
  clear focal point
→ Geometric shapes: perfect symmetry, crisp angles,
  no wobbly lines
→ Text elements: clean letterforms, consistent weight
→ Faces and portraits: smooth confident linework,
  clear feature definition

OUTPUT STANDARD:
The client should look at the output and think
"this looks like a professional tattoo artist drew this"
not "this looks like my original with dots added"
`;

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
→ Add geometric frame or border appropriate to design
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

  return `${baseRule}\n${activeRule}\n${elementRules}\n${enhancement}\n${issueCorrections ? 'SPECIFIC FIXES REQUIRED:\n' + issueCorrections : ''}`;
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
            .median(2)
            .normalise()
            .linear(2.5, -120) // Soft contrast boost to clean background
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
        let errorMessage = err.message || "An unknown error occurred";
        if (errorMessage.includes("429") && errorMessage.includes("Your project has exceeded")) {
            errorMessage = "Gemini API Quota Exceeded: Your project has reached its usage limit for the Gemini API. Please check your Google Cloud Console billing/quotas or try again later.";
        }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
