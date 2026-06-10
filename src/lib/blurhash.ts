import { decode } from 'blurhash';

export function blurhashToDataURL(hash: string): string {
    try {
        // Drastically dropping from 32x32 (1024 loops) to 1x1 (1 loop) for massive CPU savings
        const pixels = decode(hash, 1, 1);

        const r = pixels[0];
        const g = pixels[1];
        const b = pixels[2];

        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1 1"><rect width="1" height="1" fill="rgb(${r},${g},${b})" /></svg>`;

        // Use encodeURIComponent which is vastly faster and safer on the Client than Base64 Buffer polyfills
        return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    } catch (_e) {
        // fallback gray pixel
        return 'data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';
    }
}
