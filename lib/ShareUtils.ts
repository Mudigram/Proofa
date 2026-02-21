/**
 * Utilities for sharing documents via WhatsApp and Web Share API.
 */

interface ShareOptions {
    title: string;
    text: string;
    url?: string;
    files?: File[];
}

/**
 * Shares content using the native Web Share API.
 */
export const shareContent = async (options: ShareOptions): Promise<boolean> => {
    if (typeof navigator === "undefined" || !navigator.share) {
        console.warn("Web Share API not supported on this browser.");
        return false;
    }

    try {
        await navigator.share(options);
        return true;
    } catch (error) {
        if ((error as any).name !== "AbortError") {
            console.error("Error sharing content:", error);
        }
        return false;
    }
};

/**
 * Opens WhatsApp with a pre-filled message.
 */
export const shareOnWhatsApp = (text: string) => {
    const encodedText = encodeURIComponent(text);
    // Use api.whatsapp.com for better cross-platform compatibility
    const url = `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(url, "_blank");
};

/**
 * Converts a data URL to a File object for sharing.
 */
export const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File | null> => {
    try {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        return new File([blob], filename, { type: "image/png" });
    } catch (e) {
        console.error("Error converting dataUrl to File:", e);
        return null;
    }
};
