export async function checkImageLink(url: string): Promise<boolean> {
    try {
        const response = await fetch(url, {
            method: 'HEAD',
            // Small timeout to prevent breaking pages for too long
            signal: AbortSignal.timeout(3000)
        });

        // Ensure the response is OK and it is actually an image
        if (!response.ok) return false;

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) return false;

        return true;
    } catch (e) {
        return false;
    }
}
