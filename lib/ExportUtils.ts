import html2canvas from "html2canvas";

/**
 * Captures a DOM element and returns it as a high-quality PNG data URL.
 */
export const captureElementAsImage = async (elementId: string): Promise<string | null> => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id ${elementId} not found.`);
        return null;
    }

    try {
        // We use a scale of 2 for a good balance between quality and mobile performance
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
            allowTaint: true,
            scrollX: 0,
            scrollY: 0, // Better to use 0 if we scroll to top
        });

        return canvas.toDataURL("image/png", 0.9);
    } catch (error) {
        console.error("Error capturing element:", error);
        return null;
    }
};

/**
 * Triggers a download of a data URL image.
 * Uses Blobs for better mobile compatibility.
 */
export const downloadImage = (dataUrl: string, filename: string) => {
    try {
        // Convert dataUrl to Blob for better mobile support
        const parts = dataUrl.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);

        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        const blob = new Blob([uInt8Array], { type: contentType });
        const url = URL.createObjectURL(blob);

        const link = document.body.appendChild(document.createElement("a"));
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        link.click();

        // Cleanup
        setTimeout(() => {
            URL.revokeObjectURL(url);
            document.body.removeChild(link);
        }, 100);
    } catch (e) {
        console.error("Download failed, falling back to window.open", e);
        window.open(dataUrl, '_blank');
    }
};
