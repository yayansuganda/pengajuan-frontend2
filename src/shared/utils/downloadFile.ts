/**
 * downloadFile - compatible with Flutter WebView.
 *
 * The HTML `download` attribute is ignored by Flutter WebView (Android/iOS).
 * This utility fetches the file as a Blob and triggers the download
 * programmatically, which works in both regular browsers and Flutter WebView.
 *
 * @param url      - URL of the file to download (absolute or relative)
 * @param filename - Suggested file name for the saved file
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
    } catch {
        // Fallback: open in new tab (Flutter can intercept _blank navigation)
        window.open(url, '_blank');
    }
}
