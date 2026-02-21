/**
 * Captures a DOM element and returns it as a high-quality PNG data URL or triggers a PDF download.
 * Uses html2canvas for refined image capture and jspdf for professional PDF export.
 */
export const captureElementAsImage = async (elementId: string): Promise<string | null> => {
    if (typeof window === 'undefined') return null;

    const originalElement = document.getElementById(elementId);
    if (!originalElement) {
        console.error(`Element with id ${elementId} not found.`);
        return null;
    }

    try {
        const html2canvas = (await import("html2canvas")).default;

        const canvas = await html2canvas(originalElement, {
            scale: 3, // High resolution for crispness
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
            windowWidth: originalElement.scrollWidth,
            windowHeight: originalElement.scrollHeight,
            onclone: (clonedDoc) => {
                const element = clonedDoc.getElementById(elementId);
                if (element) {
                    // Remove shadows and artifacts that cause "buggy boxes"
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

        return canvas.toDataURL("image/png", 1.0);
    } catch (error) {
        console.error("Error capturing element:", error);
        return null;
    }
};

/**
 * Generates and downloads a professional PDF of the document.
 */
export const downloadAsPDF = async (elementId: string, filename: string) => {
    if (typeof window === 'undefined') return;

    const originalElement = document.getElementById(elementId);
    if (!originalElement) return;

    try {
        const jspdf = (await import("jspdf")).jsPDF;
        const html2canvas = (await import("html2canvas")).default;

        const canvas = await html2canvas(originalElement, {
            scale: 2, // 2x is enough for sharp PDF while keeping file size small
            useCORS: true,
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

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        // If content is longer than A4, we might need multiple pages or taller page
        // For Proofa invoices, a single long page or standard A4 usually works
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(filename);
        return true;
    } catch (error) {
        console.error("PDF generation failed:", error);
        return false;
    }
};

/**
 * Triggers a download of a data URL image.
 */
export const downloadImage = (dataUrl: string, filename: string) => {
    if (typeof window === 'undefined') return;

    try {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (e) {
        console.error("Download failed", e);
        window.open(dataUrl, '_blank');
    }
};
