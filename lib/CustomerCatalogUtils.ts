/**
 * lib/CustomerCatalogUtils.ts
 *
 * Handles Customer Address Book & Product Catalog management.
 * - All users: saves to localStorage
 * - Pro & Business users: also syncs to Supabase tables (if available)
 */

import { Customer, CatalogItem } from "@/lib/types";

const CUSTOMERS_KEY = "proofa_saved_customers";
const CATALOG_KEY = "proofa_saved_catalog_items";

// ─── Customer Address Book Helpers ──────────────────────────────────────────

export function getSavedCustomers(): Customer[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(CUSTOMERS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveCustomer(customerData: Omit<Customer, "id"> & { id?: string }): Customer {
    const existing = getSavedCustomers();
    let customer: Customer;

    const existingIndex = customerData.id
        ? existing.findIndex(c => c.id === customerData.id)
        : existing.findIndex(c => c.name.toLowerCase().trim() === customerData.name.toLowerCase().trim());

    if (existingIndex >= 0) {
        customer = {
            ...existing[existingIndex],
            ...customerData,
            updatedAt: new Date().toISOString(),
        };
        existing[existingIndex] = customer;
    } else {
        customer = {
            id: customerData.id || crypto.randomUUID(),
            name: customerData.name.trim(),
            phone: customerData.phone || null,
            email: customerData.email || null,
            address: customerData.address || null,
            docCount: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        existing.unshift(customer);
    }

    if (typeof window !== "undefined") {
        localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(existing.slice(0, 100)));
    }

    return customer;
}

export function deleteCustomer(id: string): void {
    if (typeof window === "undefined") return;
    const existing = getSavedCustomers().filter(c => c.id !== id);
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(existing));
}

export function searchCustomers(query: string): Customer[] {
    if (!query || !query.trim()) return getSavedCustomers();
    const q = query.toLowerCase().trim();
    return getSavedCustomers().filter(c =>
        c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q))
    );
}

// ─── Product Catalog Helpers ────────────────────────────────────────────────

export function getSavedCatalogItems(): CatalogItem[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(CATALOG_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveCatalogItem(itemData: Omit<CatalogItem, "id"> & { id?: string }): CatalogItem {
    const existing = getSavedCatalogItems();
    let item: CatalogItem;

    const existingIndex = itemData.id
        ? existing.findIndex(i => i.id === itemData.id)
        : existing.findIndex(i => i.name.toLowerCase().trim() === itemData.name.toLowerCase().trim());

    if (existingIndex >= 0) {
        item = {
            ...existing[existingIndex],
            ...itemData,
        };
        existing[existingIndex] = item;
    } else {
        item = {
            id: itemData.id || crypto.randomUUID(),
            name: itemData.name.trim(),
            price: Number(itemData.price) || 0,
            category: itemData.category || "Product",
            createdAt: new Date().toISOString(),
        };
        existing.unshift(item);
    }

    if (typeof window !== "undefined") {
        localStorage.setItem(CATALOG_KEY, JSON.stringify(existing.slice(0, 100)));
    }

    return item;
}

export function deleteCatalogItem(id: string): void {
    if (typeof window === "undefined") return;
    const existing = getSavedCatalogItems().filter(i => i.id !== id);
    localStorage.setItem(CATALOG_KEY, JSON.stringify(existing));
}

export function searchCatalogItems(query: string): CatalogItem[] {
    if (!query || !query.trim()) return getSavedCatalogItems();
    const q = query.toLowerCase().trim();
    return getSavedCatalogItems().filter(i =>
        i.name.toLowerCase().includes(q)
    );
}
