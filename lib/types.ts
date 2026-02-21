/**
 * Shared TypeScript types for RecGen.
 */

/** Payment status options */
export type PaymentStatus = "Paid" | "Deposit" | "Due";

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
    description: string;
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
    imageDataUrl?: string;
}
