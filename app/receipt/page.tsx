import { Suspense } from "react";
import ReceiptForm from "@/components/forms/ReceiptForm";

export default function ReceiptPage() {
    return (
        <main className="app-container py-6 pb-32">
            <Suspense fallback={<div className="p-8 text-center text-surface-400 dark:text-surface-500">Loading editor...</div>}>
                <ReceiptForm />
            </Suspense>
        </main>
    );
}
