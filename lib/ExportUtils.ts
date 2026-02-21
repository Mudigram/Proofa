/**
 * Captures a DOM element and returns it as a high-quality PNG data URL or triggers a PDF download.
 * Uses html2canvas for refined image capture and jspdf for professional PDF export.
 */
export const captureElementAsImage = async (elementId: string): Promise<string | null> => {
    if (typeof window === 'undefined') return null;

    const originalElement = document.getElementById(elementId);
    if (!originalElement) {
        console.error(`[Export] Element with id ${elementId} not found.`);
        return null;
    }

    console.log(`[Export] Starting capture for ${elementId}...`);

    try {
        const html2canvas = (await import("html2canvas")).default;

        const canvas = await html2canvas(originalElement, {
            scale: 2, // 2x is high quality while remaining mobile-safe
            useCORS: true,
            logging: true,
            backgroundColor: "#ffffff",
            width: originalElement.offsetWidth,
            height: originalElement.offsetHeight,
            onclone: (clonedDoc) => {
                const element = clonedDoc.getElementById(elementId);
                if (element) {
                    // Remove shadows/animations that cause artifacts
                    const allElements = element.getElementsByTagName('*');
                    for (let i = 0; i < allElements.length; i++) {
                        const el = allElements[i] as HTMLElement;
                        el.style.boxShadow = 'none';
                        el.style.textShadow = 'none';
                        el.style.animation = 'none';
                        el.style.transition = 'none';
                    }
                }
            }
        });

        console.log(`[Export] Canvas generated: ${canvas.width}x${canvas.height}`);
        return canvas.toDataURL("image/png", 0.9);
    } catch (error) {
        console.error("[Export] Capture failed:", error);
        return null;
    }
};

/**
 * Generates and downloads a professional PDF of the document.
 */
export const downloadAsPDF = async (elementId: string, filename: string) => {
    if (typeof window === 'undefined') return false;

    const originalElement = document.getElementById(elementId);
    if (!originalElement) return false;

    console.log(`[Export] Generating PDF for ${elementId}...`);

    try {
        const jspdf = (await import("jspdf")).jsPDF;
        const html2canvas = (await import("html2canvas")).default;

        const canvas = await html2canvas(originalElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: "#ffffff",
            onclone: (clonedDoc) => {
                const element = clonedDoc.getElementById(elementId);
                if (element) {
                    const allElements = element.getElementsByTagName('*');
                    for (let i = 0; i < allElements.length; i++) {
                        const el = allElements[i] as HTMLElement;
                        el.style.boxShadow = 'none';
                        el.style.textShadow = 'none';
                        el.style.animation = 'none';
                    }
                }
            }
        });

        const imgData = canvas.toDataURL('image/png', 0.9);
        const pdf = new jspdf({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(filename);

        console.log(`[Export] PDF saved successfully.`);
        return true;
    } catch (error) {
        console.error("[Export] PDF generation failed:", error);
        return false;
    }
};

/**
 * Triggers a download of a data URL image using Blobs for mobile compatibility.
 */
export const downloadImage = async (dataUrl: string, filename: string) => {
    if (typeof window === 'undefined') return;

    console.log(`[Export] Triggering image download...`);

    try {
        // Direct manual base64 to Blob conversion for stability
        const parts = dataUrl.split(',');
        const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
        const binary = atob(parts[1]);
        const array = [];
        for (let i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        const blob = new Blob([new Uint8Array(array)], { type: mime });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();

        // Cleanup with longer timeout for mobile
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }, 1000);

        console.log(`[Export] Download triggered successfully.`);
    } catch (e) {
        console.error("[Export] Download failed:", e);
        window.open(dataUrl, '_blank');
    }
};
