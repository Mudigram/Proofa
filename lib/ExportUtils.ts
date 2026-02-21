import domtoimage from "dom-to-image-more";

/**
 * Captures a DOM element and returns it as a high-quality PNG data URL.
 * Uses dom-to-image-more for better mobile compatibility.
 */
export const captureElementAsImage = async (elementId: string): Promise<string | null> => {
    const originalElement = document.getElementById(elementId);
    if (!originalElement) {
        console.error(`Element with id ${elementId} not found.`);
        return null;
    }

    // Clone the element to avoid issues with parent scaling/overflow
    const clone = originalElement.cloneNode(true) as HTMLElement;
    clone.style.position = 'fixed';
    clone.style.top = '-9999px';
    clone.style.left = '0';
    clone.style.width = originalElement.offsetWidth + 'px';
    clone.style.transform = 'none';
    clone.style.margin = '0';
    clone.id = `clone-${elementId}`;

    document.body.appendChild(clone);

    try {
        // Wait for images in the clone to load
        const images = clone.getElementsByTagName('img');
        await Promise.all(Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
            });
        }));

        const dataUrl = await domtoimage.toPng(clone, {
            quality: 0.95,
            bgcolor: "#ffffff",
            width: originalElement.offsetWidth,
            height: originalElement.offsetHeight,
        });

        return dataUrl;
    } catch (error) {
        console.error("Error capturing element with dom-to-image-more:", error);
        return null;
    } finally {
        document.body.removeChild(clone);
    }
};

/**
 * Triggers a download of a data URL image.
 * Uses Blobs for better mobile compatibility.
 */
export const downloadImage = (dataUrl: string, filename: string) => {
    try {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (e) {
        console.error("Download failed", e);
        // Fallback for mobile restricted environments
        const newWindow = window.open();
        if (newWindow) {
            newWindow.document.write(`<img src="${dataUrl}" style="width:100%" />`);
            newWindow.document.title = filename;
        }
    }
};
