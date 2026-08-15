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
    // Stencil ready if EXIF has high DPI, or if absolute pixel size is high (>=1200px)
    const stencil_dpi_ready = (dpi >= 203) || (Math.min(metadata.width, metadata.height) >= 1200);
    
    let warnings: string[] = [];
    let blowout_risk = 0;
    
    // Grayscale thresholded base for pixel analysis
    const binary = image.clone().grayscale().threshold(128);
    const { data: binData } = await binary.raw().toBuffer({ resolveWithObject: true });
    
    let totalBlack = 0;
    for (let i = 0; i < binData.length; i++) {
        if (binData[i] < 128) totalBlack++;
    }
    
    const totalPixels = metadata.width * metadata.height;
    const totalWhite = totalPixels - totalBlack;
    const negSpaceRatio = totalWhite / totalPixels;
    
    // --- 1. Negative Space Scoring (25%) ---
    let negSpaceScore = 25;
    let negSpaceFlag = false;
    if (negSpaceRatio < 0.4) {
        negSpaceScore = Math.max(0, 25 - (0.4 - negSpaceRatio) * 100);
        negSpaceFlag = true;
        warnings.push("High ink density: Negative space is below 40%, high risk of merging over time.");
    } else if (negSpaceRatio > 0.95) {
        negSpaceScore = Math.max(10, 25 - (negSpaceRatio - 0.95) * 200);
        negSpaceFlag = true;
        warnings.push("Empty design: Negative space is extremely high (>95%), very few lines detected.");
    }

    // --- 2. Line Weight Scoring (25%) via Morphological Erosion ---
    // Invert -> Blur -> Threshold -> Invert to simulate erosion of black lines
    const eroded = image.clone()
        .grayscale()
        .threshold(128)
        .negate() // invert so lines are white
        .blur(1.5) // blur to eat edges
        .threshold(200) // threshold high to erode
        .negate(); // invert back
    
    const { data: erodedData } = await eroded.raw().toBuffer({ resolveWithObject: true });
    let erodedBlack = 0;
    for (let i = 0; i < erodedData.length; i++) {
        if (erodedData[i] < 128) erodedBlack++;
    }

    // Compare black pixels before and after erosion
    const lineLossRatio = totalBlack > 0 ? (totalBlack - erodedBlack) / totalBlack : 1;
    let lineWeightScore = 25;
    let lineWeightFlag = false;
    
    if (lineLossRatio > 0.7 && totalBlack > 50) {
        lineWeightScore = Math.max(0, 25 - (lineLossRatio - 0.7) * 100);
        lineWeightFlag = true;
        blowout_risk += 40;
        warnings.push("Very thin lines: Over 70% of linework was lost during safety erosion test. High risk of blowouts or fading.");
    } else if (totalBlack < 50) {
        lineWeightScore = 0;
        lineWeightFlag = true;
        warnings.push("No distinct linework detected.");
    }

    // --- 3. Complexity (Sobel Edge Density) (20%) ---
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
    // Lowered complexity threshold from 0.15 to 0.08 based on real-world line art density
    if (edgeDensity > 0.08) {
        complexityScore = Math.max(0, 20 - (edgeDensity - 0.08) * 150);
        complexityFlag = true;
        warnings.push("High detail complexity: High edge density. Details may blur together as skin ages.");
    }

    // --- 4. Contrast Distribution (15%) ---
    const stats = await image.clone().stats();
    const luma = stats.channels[0];
    const contrastSD = luma.stdev;
    
    let contrastScore = 15;
    let contrastFlag = false;
    
    // Clean line art with lots of negative space naturally has a lower stdev because it is mostly white.
    // We flag low contrast if the dynamic range is narrow (washed out) OR if there are no true black values (min > 80).
    const minVal = luma.min;
    const maxVal = luma.max;
    const range = maxVal - minVal;
    
    if (range < 150 || minVal > 80) {
        contrastScore = range < 150 ? 5 : 10;
        contrastFlag = true;
        warnings.push("Low contrast: Lacks defined black ink values. Needs contrast snapping.");
    }

    // --- 5. Scale/Legibility (15%) ---
    let scaleScore = 15;
    let scaleFlag = false;
    let recommended_min_size_cm = 5;
    if (edgeDensity > 0.06) recommended_min_size_cm = 10;
    if (edgeDensity > 0.12) recommended_min_size_cm = 15;

    if (metadata.width < 800 || metadata.height < 800) {
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
            contrast: { score: Math.round(contrastScore), flag: contrastFlag, variance: Math.round(contrastSD), note: contrastFlag ? 'Washed out' : 'Strong contrast' },
            scale: { score: Math.round(scaleScore), flag: scaleFlag, min_element_px: 0, note: scaleFlag ? 'Too small' : 'Good scale' },
        },
        transformations_applied: [],
        artist_warnings: warnings,
        blowout_risk_percent: Math.min(100, blowout_risk),
        recommended_min_size_cm,
        stencil_dpi_ready
    };
}
