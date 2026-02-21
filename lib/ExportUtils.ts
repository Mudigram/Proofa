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
        // We use a higher scale for better print quality
        const canvas = await html2canvas(element, {
            scale: 3,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
            scrollX: 0,
            scrollY: -window.scrollY, // Ensure we capture the element even if scrolled
        });

        return canvas.toDataURL("image/png", 1.0);
    } catch (error) {
        console.error("Error capturing element:", error);
        return null;
    }
};

/**
 * Triggers a download of a data URL image.
 */
export const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
