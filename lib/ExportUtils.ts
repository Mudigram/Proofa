/**
 * ExportUtils.ts
 * Uses html-to-image instead of html2canvas.
 * html-to-image renders via SVG foreignObject, which delegates all CSS
 * parsing to the browser itself — so oklab/oklch, container queries,
 * and every other modern CSS feature just works.
 *
 * Install: npm install html-to-image
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Clones a node, strips transforms on it and all its ancestors,
 * and returns { clone, cleanup }.
 * We render this clean clone off-screen so the captured image is never
 * affected by any scale()/translate() on the visual preview wrapper.
 */
const buildCleanClone = (root: HTMLElement): { clone: HTMLElement; container: HTMLDivElement; cleanup: () => void } => {
    const container = document.createElement("div");

    // Position off-screen, not display:none — html-to-image needs it painted
    Object.assign(container.style, {
        position: "fixed",
        top: "0",
        left: "-99999px",
        width: `${root.scrollWidth}px`,
        zIndex: "-1",
        pointerEvents: "none",
        overflow: "visible",
    });

    const clone = root.cloneNode(true) as HTMLElement;

    // Reset any transforms / overflow on the clone itself
    Object.assign(clone.style, {
        transform: "none",
        scale: "unset",
        overflow: "visible",
        position: "relative",
        margin: "0",
        height: "auto",
        maxHeight: "none",
    });

    container.appendChild(clone);
    document.body.appendChild(container);

    const cleanup = () => {
        if (document.body.contains(container)) document.body.removeChild(container);
    };

    return { clone, container, cleanup };
};

// ─── Core capture ─────────────────────────────────────────────────────────────

/**
 * Utility to wait for all images inside an element to be fully loaded.
 * Crucial for Safari which often snapshots before the 'foreignObject' images settle.
 */
const waitForImages = async (element: HTMLElement) => {
    const images = Array.from(element.getElementsByTagName("img"));
    const promises = images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve; // Continue anyway on error
        });
    });
    await Promise.all(promises);
};

export const captureElementAsImage = async (elementId: string): Promise<string | null> => {
    if (typeof window === "undefined") return null;

    const root = document.getElementById(elementId);
    if (!root) {
        console.error(`[Export] Element #${elementId} not found`);
        return null;
    }

    const oldScrollY = window.scrollY;
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 100)); // Slightly longer settle

    // Build a transform-free off-screen clone
    const { clone, cleanup } = buildCleanClone(root);

    try {
        const { toPng } = await import("html-to-image");

        // 1. Wait for images in the clone to actually be ready
        await waitForImages(clone);

        // 2. Safari "Priming" — calling it once to wake up the SVG engine
        // Many browsers (esp Safari) need a dry run for symbols/blobs to inline
        await toPng(clone, { quality: 0.1, pixelRatio: 1 });
        await new Promise(r => setTimeout(r, 50));

        // 3. The real capture
        const dataUrl = await toPng(clone, {
            pixelRatio: 2,
            backgroundColor: "#ffffff",
            cacheBust: true,
            filter: (node) => {
                if (node instanceof HTMLElement) {
                    if (node.tagName === "IFRAME") return false;
                }
                return true;
            },
        });

        window.scrollTo(0, oldScrollY);
        return dataUrl;

    } catch (error) {
        console.error("[Export] Capture failed:", error);
        return null;
    } finally {
        cleanup();
    }
};

// ─── PDF export ───────────────────────────────────────────────────────────────

export const downloadAsPDF = async (elementId: string, filename: string): Promise<boolean> => {
    if (typeof window === "undefined") return false;

    try {
        const jspdfModule = await import("jspdf");
        const jsPDF = jspdfModule.jsPDF || (jspdfModule as any).default;

        const dataUrl = await captureElementAsImage(elementId);
        if (!dataUrl) return false;

        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve) => (img.onload = resolve));

        const imgWidth = 210; // A4 width in mm
        const imgHeight = (img.height * imgWidth) / img.width;

        const pdf = new jsPDF({ orientation: "p", unit: "mm", format: [imgWidth, imgHeight] });
        pdf.addImage(dataUrl, "PNG", 0, 0, imgWidth, imgHeight, undefined, "FAST");
        pdf.save(filename);
        return true;

    } catch (error) {
        console.error("[Export] PDF generation failed:", error);
        return false;
    }
};

// ─── Image download ───────────────────────────────────────────────────────────

export const downloadImage = async (dataUrl: string, filename: string): Promise<void> => {
    if (typeof window === "undefined") return;

    try {
        const [meta, b64] = dataUrl.split(",");
        const mime = meta.match(/:(.*?);/)?.[1] ?? "image/png";
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

        const blob = new Blob([bytes], { type: mime });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            if (document.body.contains(a)) document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 2000);


    } catch (e) {
        console.error("[Export] Download failed:", e);
        window.open(dataUrl, "_blank");
    }
};