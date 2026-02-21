import { Suspense } from "react";
import InvoiceForm from "@/components/forms/InvoiceForm";

export default function InvoicePage() {
    return (
        <main className="app-container py-6 pb-32">
            <Suspense fallback={<div className="p-8 text-center text-surface-400">Loading editor...</div>}>
                <InvoiceForm />
            </Suspense>
        </main>
    );
}
