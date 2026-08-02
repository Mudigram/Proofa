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

// ─── Extract amount from any document type ───────────────────────────────────

export function extractAmount(
    data: ReceiptData | InvoiceData | OrderData,
    type: DocumentType
): number {
    if (!data) return 0;
    
    if (type === "receipt") {
        const r = data as ReceiptData;
        const explicit = Number(r.amount) || 0;
        if (explicit > 0) return explicit;
        const subtotal = Array.isArray(r.items)
            ? r.items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.price) || 0), 0)
            : 0;
        const delivery = r.deliveryInfo?.enabled ? (Number(r.deliveryInfo.cost) || 0) : 0;
        return subtotal + delivery;
    }
    if (type === "invoice") {
        const inv = data as InvoiceData;
        const subtotal = Array.isArray(inv.items)
            ? inv.items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.price) || 0), 0)
            : 0;
        const tax = inv.includeVat
            ? subtotal * ((Number(inv.vatRate) || 7.5) / 100)
            : 0;
        const delivery = inv.deliveryInfo?.enabled
            ? (Number(inv.deliveryInfo.cost) || 0)
            : 0;
        return subtotal + tax + delivery;
    }
    if (type === "order") {
        const o = data as OrderData;
        const explicit = Number(o.totalAmount || (o as any).amount) || 0;
        if (explicit > 0) return explicit;
        const subtotal = Array.isArray(o.items)
            ? o.items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.price) || 0), 0)
            : 0;
        const delivery = o.deliveryInfo?.enabled ? (Number(o.deliveryInfo.cost) || 0) : 0;
        return subtotal + delivery;
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
 * Supports in-place updates when existingDocId is provided.
 */
export async function saveDocument(
    data: ReceiptData | InvoiceData | OrderData,
    type: DocumentType,
    template: TemplateName,
    userId: string | null = null,
    ownerId: string | null = null,
    isPro: boolean = false,
    currency: string = "NGN",
    existingDocId?: string | null
): Promise<SavedDocument> {

    // Ensure amount is synced on the data object before saving
    const computedAmount = extractAmount(data, type);
    if (type === "receipt") {
        (data as ReceiptData).amount = computedAmount;
    } else if (type === "order") {
        (data as OrderData).totalAmount = computedAmount;
    }

    const existing = getHistory();
    let doc: SavedDocument;

    const existingIndex = existingDocId ? existing.findIndex(d => d.id === existingDocId) : -1;

    if (existingIndex >= 0) {
        // In-place update existing document
        doc = {
            ...existing[existingIndex],
            type,
            template,
            data,
            updatedAt: new Date().toISOString(),
        };
        existing[existingIndex] = doc;
        persistDocuments(existing);
    } else {
        // Create new document
        doc = {
            id: crypto.randomUUID(),
            type,
            template,
            data,
            createdAt: new Date().toISOString(),
        };
        const updated = [doc, ...existing].slice(0, MAX_LOCAL);
        persistDocuments(updated);
    }

    // ── 2. Save to Supabase for Pro + Business users ──────────────────────────
    if (isPro && userId && ownerId) {
        const amount = computedAmount;
        const customer = extractCustomer(data, type);

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
