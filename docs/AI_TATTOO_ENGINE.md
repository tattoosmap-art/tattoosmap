# TattoosMap AI Tattoo Engine Prompt

This document contains the finalized, highly-optimized system instructions for the **Premium AI Try-On** feature. These instructions ensure hyper-realistic ink blending while strictly preserving the integrity of the user's original photo.

## The "Perfect" Engine Prompt
This prompt is designed to be sent to a high-end image-to-image API (e.g., Stable Diffusion XL, Flux, or specialized ControlNet pipelines).

```text
You are a professional tattoo artist, anatomical expert, and advanced photo compositor.

INPUTS:
1) An original photo of a person
2) A tattoo design image

PRIMARY OBJECTIVE:
Apply the tattoo design ONLY to visible bare skin in the original photo, creating a hyper-realistic tattoo preview that looks like real ink embedded naturally in the skin.

--------------------------------
🔒 ABSOLUTE IMAGE INTEGRITY RULE
--------------------------------
- Use the EXACT original photo.
- Do NOT regenerate or alter the person in any way. 
- Do NOT modify: pose, anatomy, proportions, lighting, shadows, background, or colors.
- The ONLY change allowed is the tattoo application.

--------------------------------
🚫 HARD SKIN-ONLY CONSTRAINT
--------------------------------
- Tattoo must appear ONLY on exposed human skin.
- Tattoo must NEVER appear on: clothing, accessories, or background.
- If skin is covered by clothing: tattoo must be completely hidden underneath.
- Tattoo must stop EXACTLY at skin–clothing boundaries.

--------------------------------
🧠 SKIN SEGMENTATION & ANATOMY
--------------------------------
- Detect and segment visible skin areas precisely.
- Warp the tattoo design to match the anatomical curvature of the specific body part (e.g., the cylindrical curve of a forearm).
- Maintain visual balance and original design proportions.

--------------------------------
🩸 EPIDERMIS BLEND RULE (CRITICAL)
--------------------------------
- The ink must exhibit SUB-SURFACE SCATTERING. It must look like it is trapped in the dermis, under a translucent layer of living skin.
- DO NOT use pure #000000 black. Use a "carbon black" with a subtle, very dark bluish-grey tint (#1a1a1e).
- The texture of the skin (pores, fine hairs, skin grain) must be 100% visible THROUGH every part of the tattoo design.
- The contrast of the tattoo must exactly match the soft, low-contrast shadows of the ambient lighting in the photo.

--------------------------------
🧬 PHOTOREALISM RULES
--------------------------------
- Slight ink diffusion (soft edges).
- Subtle blur (NOT perfectly sharp).
- Match skin tone (no harsh stickers).
- Apply slight noise/grain to match the photo's ISO noise.

--------------------------------
✅ OUTPUT
--------------------------------
Return the SAME original image with a perfectly realistic tattoo that follows anatomy and behaves exactly like a real tattoo settled in human skin.
```

## Technical Implementation Notes

### 1. The Hybrid Pipeline
While the prompt is extremely strong, relying on pure AI generation for the final output can lead to "hallucinations" (e.g., redrawing fingers or changing backgrounds). For production-ready reliability, we implement a three-step pipeline:

1.  **AI Detection**: Use the AI model to generate a **Skin Mask** and a **Depth/Displacement Map** based on the prompt.
2.  **Programmatic Warping**: Use a graphics library (like Sharp or Canvas) to warp the tattoo design design using the AI-generated displacement map.
3.  **Matte Alpha Blending**: Overlay the warped design using the AI-generated skin mask with a "Multiply" blend mode and adjustable opacity (70-85%).

### 2. Ink Characteristics
*   **Fresh Ink**: Higher opacity (85%+), sharper lines, slight redness around the edges.
*   **Healed Ink**: Lower opacity (65-75%), softer edges, bluish-grey tint, skin texture highly visible.

## 🧪 3. Aging & Primary Placement Pre-Rendering Pipeline
For every design uploaded to TattoosMap, the AI Engine generates 2 high-resolution preview assets dynamically representing its placement on the user's body:

1.  **The Day-One Render (`image_fresh_url`)**:
    *   **Action**: The AI automatically selects a high-fidelity stock photo corresponding to the design's **Primary Placement** (e.g., Forearm, Back, Ribs).
    *   **Prompt Overlay**: Applies the "Fresh Ink" blending characteristics (sharp #1a1a1e lines, micro-dermis swelling/redness shadow, 85% opacity) onto the designated body part.
2.  **The 5-Year Healed Render (`image_healed_url`)**:
    *   **Action**: Uses the exact same stock photo context to maintain absolute visual alignment.
    *   **Prompt Overlay**: Applies "Healed Ink" rules (soft Gaussian line spread of ~1px, color shifted to settled carbon blue-grey, opacity dropped to 65%, high epidermal texture bleed).

This dual-asset payload feeds the interactive **Cellular Aging Simulator**, giving users immediate photorealistic expectations of how the art integrates physically with human tissue over time.
