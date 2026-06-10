/**
 * downloadImage.ts
 * 
 * Canvas-based watermark utility. Loads an image via a proxy/CORS-safe URL,
 * draws a branded 'TATTOOSMAP' watermark in the bottom-right corner, and
 * triggers a browser download.
 */

export async function downloadImage(imageUrl: string, designTitle: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            const ctx = canvas.getContext("2d");
            if (!ctx) return reject(new Error("Canvas context unavailable"));

            // Draw the source image
            ctx.drawImage(img, 0, 0);

            // --- Watermark Configuration ---
            const fontSize = Math.max(14, Math.round(img.naturalWidth * 0.018));
            const fontFamily = `"DM Mono", "Courier New", monospace`;
            const text = "T A T T O O S M A P";
            const padding = Math.round(img.naturalWidth * 0.025);

            ctx.font = `500 ${fontSize}px ${fontFamily}`;

            // Measure text width
            const metrics = ctx.measureText(text);
            const textWidth = metrics.width;
            const textHeight = fontSize;

            // Background pill — stark, no radius (a thin matte bar)
            const barPadY = Math.round(fontSize * 0.5);
            const barPadX = Math.round(fontSize * 0.7);
            const barX = canvas.width - textWidth - barPadX * 2 - padding;
            const barY = canvas.height - textHeight - barPadY * 2 - padding;
            const barW = textWidth + barPadX * 2;
            const barH = textHeight + barPadY * 2;

            // Pure black, low opacity bar (editorial, not garish)
            ctx.fillStyle = "rgba(0, 0, 0, 0.42)";
            ctx.fillRect(barX, barY, barW, barH);

            // Watermark text — pure white, subtle
            ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
            ctx.font = `500 ${fontSize}px ${fontFamily}`;
            ctx.textBaseline = "top";
            ctx.fillText(text, barX + barPadX, barY + barPadY);

            // Trigger download
            canvas.toBlob((blob) => {
                if (!blob) return reject(new Error("Failed to create image blob"));

                const safeTitle = designTitle
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "");

                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `tattoosmap-${safeTitle || "design"}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                resolve();
            }, "image/png");
        };

        img.onerror = () => reject(new Error("Failed to load image for watermarking"));
        img.src = imageUrl;
    });
}
