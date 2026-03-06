/**
 * Shared TypeScript types for RecGen.
 */

/** Payment status options */
export type PaymentStatus = "Paid" | "Deposit" | "Due" | "Draft";

/** Delivery status options */
export type DeliveryStatus = "Pending" | "Processing" | "Delivered";

/** Document types */
export type DocumentType = "receipt" | "invoice" | "order";

/** Template options */
export type TemplateName = "minimalist" | "bold" | "classic";

/** Form Item (for Invoices/Orders) */
export interface LineItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    category?: "Service" | "Product" | "Expense";
}

/** Payment method options */
export type PaymentMethod = "Transfer" | "Cash" | "POS" | "Card";

/** Bank Account Details */
export interface BankDetails {
    bankName: string;
    accountNumber: string;
    accountName: string;
    enabled: boolean;
}

/** Delivery Information */
export interface DeliveryInfo {
    location: string;
    cost: number;
    enabled: boolean;
}

/** Receipt form data */
export interface ReceiptData {
    businessName: string;
    customerName?: string;
    customerPhone?: string;
    items: LineItem[];
    amount: number;
    status: PaymentStatus;
    paymentMethod: PaymentMethod;
    date: string;
    logoUrl?: string;
    bankDetails?: BankDetails;
    deliveryInfo?: DeliveryInfo;
    terms?: string;
    signatureUrl?: string;
}

/** Invoice form data */
export interface InvoiceData {
    businessName: string;
    businessAddress?: string;
    clientName: string;
    clientPhone?: string;
    invoiceNumber: string;
    issueDate: string;
    dueDate?: string;
    items: LineItem[];
    status: PaymentStatus;
    notes?: string;
    logoUrl?: string;
    includeVat: boolean;
    vatRate?: number;
    bankDetails?: BankDetails;
    deliveryInfo?: DeliveryInfo;
    terms?: string;
    signatureUrl?: string;
}

/** Order summary form data */
export interface OrderData {
    customerName: string;
    customerPhone?: string;
    items: LineItem[];
    totalAmount: number;
    status: PaymentStatus;
    deliveryStatus: DeliveryStatus;
    logoUrl?: string;
    bankDetails?: BankDetails;
    deliveryInfo?: DeliveryInfo;
    terms?: string;
}

/** Saved document record in LocalStorage */
export interface SavedDocument {
    id: string;
    type: DocumentType;
    template: TemplateName;
    data: ReceiptData | InvoiceData | OrderData;
    createdAt: string;
    updatedAt?: string;
    imageDataUrl?: string;
}

// ─── Pro / Auth Types ────────────────────────────────────────────────────────

/** Subscription plan tiers */
export type SubscriptionPlan = "free" | "pro" | "business";

/**
 * User profile stored in Supabase `profiles` table.
 * Mirrors auth.users with extra business fields.
 */
export interface UserProfile {
    id: string;
    businessName?: string | null;
    logoUrl?: string | null;
    primaryColor?: string;     // default '#000000'
    accentColor?: string;      // default '#2563eb'
    defaultCurrency?: string;  // default 'NGN'
    subscriptionPlan: SubscriptionPlan; // default 'free'
    subscriptionStatus?: string; // default 'inactive'
    subscriptionRenewalDate?: string | null;
    createdAt: string;
    updatedAt: string;

    // Virtual or merged fields (for front-end convenience from auth.users)
    email?: string;
    name?: string;
}

/** A saved bank account in the Bank Vault (Pro feature) */
export interface SavedBankAccount {
    id: string;
    userId: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    createdAt: string;
}

