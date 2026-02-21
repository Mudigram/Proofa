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
    description: string;
    amount: number;
    status: PaymentStatus;
    paymentMethod: PaymentMethod;
    date: string;
    logoUrl?: string;
    bankDetails?: BankDetails;
    deliveryInfo?: DeliveryInfo;
}

/** Invoice form data */
export interface InvoiceData {
    businessName: string;
    businessAddress?: string;
    clientName: string;
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
}

/** Order summary form data */
export interface OrderData {
    customerName: string;
    items: LineItem[];
    totalAmount: number;
    deliveryStatus: DeliveryStatus;
    logoUrl?: string;
    bankDetails?: BankDetails;
    deliveryInfo?: DeliveryInfo;
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
