import { Suspense } from "react";
import OrderForm from "@/components/forms/OrderForm";

export default function OrderPage() {
    return (
        <main className="app-container py-6 pb-32">
            <Suspense fallback={<div className="p-8 text-center text-surface-400">Loading editor...</div>}>
                <OrderForm />
            </Suspense>
        </main>
    );
}
