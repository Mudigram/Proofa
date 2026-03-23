/**
 * lib/StorageUtils.ts
 *
 * Handles document persistence.
 * - All users: saves to localStorage (existing behaviour, unchanged)
 * - Pro + Business: also saves to Supabase documents table
 *
 * Drop-in replacement for your existing StorageUtils.ts
 */

import { SavedDocument, DocumentType, TemplateName } from "@/lib/types";
import { ReceiptData, InvoiceData, OrderData } from "@/lib/types";
import { saveDocumentToCloud } from "@/lib/dashboard";

const STORAGE_KEY = "proofa_documents";
const MAX_LOCAL = 20;

// ─── LocalStorage helpers (unchanged) ────────────────────────────────────────

export function getHistory(): SavedDocument[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function persistDocuments(docs: SavedDocument[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

export function getDocumentById(id: string): SavedDocument | null {
    return getHistory().find(d => d.id === id) ?? null;
}

export function deleteDocument(id: string): void {
    const docs = getHistory().filter(d => d.id !== id);
    persistDocuments(docs);
}

export function clearAllDocuments(): void {
    localStorage.removeItem(STORAGE_KEY);
}

// ─── User name (localStorage, all tiers) ─────────────────────────────────────

const USER_NAME_KEY = "proofa_user_name";

export function getUserName(): string {
    if (typeof window === "undefined") return "User";
    return localStorage.getItem(USER_NAME_KEY) || "User";
}

export function saveUserName(name: string): void {
    localStorage.setItem(USER_NAME_KEY, name.trim() || "User");
}

// ─── Extract amount from any document type ───────────────────────────────────

function extractAmount(
    data: ReceiptData | InvoiceData | OrderData,
    type: DocumentType
): number {
    if (type === "receipt") {
        return (data as ReceiptData).amount ?? 0;
    }
    if (type === "invoice") {
        const inv = data as InvoiceData;
        const subtotal = inv.items?.reduce(
            (s, i) => s + i.quantity * i.price, 0
        ) ?? 0;
        const tax = inv.includeVat
            ? subtotal * ((inv.vatRate ?? 7.5) / 100)
            : 0;
        const delivery = inv.deliveryInfo?.enabled
            ? (inv.deliveryInfo.cost ?? 0)
            : 0;
        return subtotal + tax + delivery;
    }
    if (type === "order") {
        return (data as OrderData).totalAmount ?? 0;
    }
    return 0;
}

function extractCustomer(
    data: ReceiptData | InvoiceData | OrderData,
    type: DocumentType
): { name?: string; phone?: string } {
    if (type === "receipt") {
        const r = data as ReceiptData;
        return { name: r.customerName, phone: r.customerPhone };
    }
    if (type === "invoice") {
        const i = data as InvoiceData;
        return { name: i.clientName, phone: i.clientPhone };
    }
    if (type === "order") {
        const o = data as OrderData;
        return { name: o.customerName, phone: o.customerPhone };
    }
    return {};
}

// ─── Main save function ───────────────────────────────────────────────────────

/**
 * Saves a document to localStorage (all users) and Supabase (Pro + Business).
 *
 * @param data       - The full form data
 * @param type       - 'receipt' | 'invoice' | 'order'
 * @param template   - 'minimalist' | 'bold' | 'classic'
 * @param userId     - Current user's id (null = anonymous, skip cloud)
 * @param ownerId    - Owner's id (= userId for owners, team_owner_id for staff)
 * @param isPro      - Whether to save to Supabase
 * @param currency   - 'NGN' | 'USD' (default 'NGN')
 */
export async function saveDocument(

    data: ReceiptData | InvoiceData | OrderData,
    type: DocumentType,
    template: TemplateName,
    userId: string | null = null,
    ownerId: string | null = null,
    isPro: boolean = false,
    currency: string = "NGN"
): Promise<SavedDocument> {

    // ── 1. Always save to localStorage ───────────────────────────────────────
    const doc: SavedDocument = {
        id: crypto.randomUUID(),
        type,
        template,
        data,
        createdAt: new Date().toISOString(),
    };

    const existing = getHistory();
    // Keep newest MAX_LOCAL documents
    const updated = [doc, ...existing].slice(0, MAX_LOCAL);
    persistDocuments(updated);

    // ── 2. Save to Supabase for Pro + Business users ──────────────────────────
    if (isPro && userId && ownerId) {
        const amount = extractAmount(data, type);
        const customer = extractCustomer(data, type);

        // Fire-and-forget — don't block the UI on the network call
        saveDocumentToCloud({
            ownerId,
            createdBy: userId,
            type,
            template,
            amount,
            currency,
            customerName: customer.name,
            customerPhone: customer.phone,
            data,
        }).catch(err =>
            console.error("[StorageUtils] Cloud save failed:", err)
        );
    }

    return doc;
}