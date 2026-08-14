import sharp from 'sharp';

export interface TattooabilityReport {
  score: number;
  grade: 'READY' | 'MINOR_ADJUST' | 'MAJOR_REWORK' | 'UNTATTOOABLE';
  breakdown: {
    line_weight: { score: number; flag: boolean; note: string };
    negative_space: { score: number; flag: boolean; ratio: number; note: string };
    complexity: { score: number; flag: boolean; density: number; note: string };
    contrast: { score: number; flag: boolean; variance: number; note: string };
    scale: { score: number; flag: boolean; min_element_px: number; note: string };
  };
  transformations_applied: string[];
  artist_warnings: string[];
  blowout_risk_percent: number;
  recommended_min_size_cm: number;
  stencil_dpi_ready: boolean;
}

export async function analyzeDermographicScore(buffer: Buffer): Promise<TattooabilityReport> {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
        throw new Error('Invalid image dimensions');
    }

    const dpi = metadata.density || 72; // Default if no EXIF density
    const stencil_dpi_ready = dpi >= 203;
    
    let warnings: string[] = [];
    let blowout_risk = 0;
    
    // --- 1. Line Weight Scoring & Negative Space ---
    const binary = image.clone().grayscale().threshold(128);
    const { data: binData } = await binary.raw().toBuffer({ resolveWithObject: true });
    
    let totalBlack = 0;
    for (let i = 0; i < binData.length; i++) {
        if (binData[i] < 128) totalBlack++;
    }
    
    const totalPixels = metadata.width * metadata.height;
    const totalWhite = totalPixels - totalBlack;
    const negSpaceRatio = totalWhite / totalPixels;
    
    let negSpaceScore = 25;
    let negSpaceFlag = false;
    if (negSpaceRatio < 0.4) {
        negSpaceScore = Math.max(0, 25 - (0.4 - negSpaceRatio) * 100);
        negSpaceFlag = true;
        warnings.push("High ink density: Negative space is below 40%, high risk of merging over time.");
    }

    // --- 2. Complexity (Sobel Edge Density) ---
    const sobel = await image.clone().grayscale().convolve({
        width: 3, height: 3,
        kernel: [-1, 0, 1, -2, 0, 2, -1, 0, 1]
    }).raw().toBuffer({ resolveWithObject: true });
    
    let edgePixels = 0;
    for (let i = 0; i < sobel.data.length; i++) {
        if (sobel.data[i] > 128) edgePixels++;
    }
    const edgeDensity = edgePixels / totalPixels;
    
    let complexityScore = 20;
    let complexityFlag = false;
    if (edgeDensity > 0.15) {
        complexityScore = Math.max(0, 20 - (edgeDensity - 0.15) * 100);
        complexityFlag = true;
        warnings.push("High detail complexity: Too many fine details per square inch. May blur as skin ages.");
    }

    // --- 3. Contrast Distribution ---
    const stats = await image.clone().stats();
    const luma = stats.channels[0];
    const contrastSpread = luma.max - luma.min;
    
    let contrastScore = 15;
    let contrastFlag = false;
    if (contrastSpread < 150) {
        contrastScore = Math.max(0, 15 - (150 - contrastSpread) / 10);
        contrastFlag = true;
        warnings.push("Low contrast spread: Design lacks distinct black and gray values.");
    }

    // --- 4. Line Weight Approximation ---
    const lineThicknessIndex = totalBlack > 0 ? (totalBlack / edgePixels) : 0;
    let lineWeightScore = 25;
    let lineWeightFlag = false;
    if (lineThicknessIndex < 1.5 && totalBlack > 0) { // adjusted to be less aggressive
         lineWeightScore = 15;
         lineWeightFlag = true;
         blowout_risk += 30;
         warnings.push("Thin lines detected: Lines may be too fine (<4px) and prone to blowout.");
    }
    
    // --- 5. Scale/Legibility ---
    let scaleScore = 15;
    let scaleFlag = false;
    let recommended_min_size_cm = 5;
    if (edgeDensity > 0.1) recommended_min_size_cm = 10;
    if (edgeDensity > 0.2) recommended_min_size_cm = 15;

    if (metadata.width < 500) {
        scaleScore = 5;
        scaleFlag = true;
        warnings.push("Low resolution: May not scale well for stencil printing.");
    }

    const totalScore = Math.round(lineWeightScore + negSpaceScore + complexityScore + contrastScore + scaleScore);
    let grade: 'READY' | 'MINOR_ADJUST' | 'MAJOR_REWORK' | 'UNTATTOOABLE' = 'READY';
    
    if (totalScore < 50) grade = 'UNTATTOOABLE';
    else if (totalScore < 70) grade = 'MAJOR_REWORK';
    else if (totalScore < 90) grade = 'MINOR_ADJUST';

    if (blowout_risk > 80) blowout_risk = 80;
    if (negSpaceRatio < 0.2) blowout_risk += 20;

    return {
        score: totalScore,
        grade,
        breakdown: {
            line_weight: { score: Math.round(lineWeightScore), flag: lineWeightFlag, note: lineWeightFlag ? 'Thin lines detected' : 'Line weight optimal' },
            negative_space: { score: Math.round(negSpaceScore), flag: negSpaceFlag, ratio: Number(negSpaceRatio.toFixed(2)), note: negSpaceFlag ? 'Too packed' : 'Good breathing room' },
            complexity: { score: Math.round(complexityScore), flag: complexityFlag, density: Number(edgeDensity.toFixed(2)), note: complexityFlag ? 'Highly complex' : 'Manageable detail' },
            contrast: { score: Math.round(contrastScore), flag: contrastFlag, variance: contrastSpread, note: contrastFlag ? 'Washed out' : 'Strong contrast' },
            scale: { score: Math.round(scaleScore), flag: scaleFlag, min_element_px: 0, note: scaleFlag ? 'Too small' : 'Good scale' },
        },
        transformations_applied: [],
        artist_warnings: warnings,
        blowout_risk_percent: Math.min(100, blowout_risk),
        recommended_min_size_cm,
        stencil_dpi_ready
    };
}
