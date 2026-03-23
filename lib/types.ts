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
    accentColor?: string;      // default '#eb8525'
    defaultCurrency?: string;  // default 'NGN'
    subscriptionPlan: SubscriptionPlan; // default 'free'
    subscriptionStatus?: string; // default 'inactive'
    subscriptionRenewalDate?: string | null;
    createdAt: string;
    updatedAt: string;

    role?: UserRole;
    teamOwnerId?: string | null;
    isBusiness?: boolean;

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

// ─── Profile extensions ───────────────────────────────────────────────────────
export type UserRole = "owner" | "staff";

/** Extends UserProfile with Business Plan fields */
export interface BusinessProfile {
    role: UserRole;
    teamOwnerId: string | null; // null = owner, uuid = staff
    isBusiness: boolean;
}

// ─── Brand settings ───────────────────────────────────────────────────────────

export interface BrandSettings {
    ownerId: string;
    logoUrl: string | null;
    brandColor: string;
    bankAccounts: VaultBankAccount[];
    termsDefault: string | null;
    defaultNote: string | null;
    updatedAt: string;
}

export interface VaultBankAccount {
    id: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    isDefault: boolean;
}

// ─── Documents ───────────────────────────────────────────────────────────────

/** A document row as stored in Supabase */
export interface DocumentRecord {
    id: string;
    ownerId: string;
    createdBy: string;
    type: DocumentType;
    template: TemplateName;
    amount: number;
    currency: string;
    customerName: string | null;
    customerPhone: string | null;
    data: ReceiptData | InvoiceData | OrderData;
    deletedAt: string | null;
    createdAt: string;
}

// ─── Team ────────────────────────────────────────────────────────────────────

export type TeamMemberStatus = "pending" | "active" | "removed";

export interface TeamMember {
    id: string;
    ownerId: string;
    memberId: string | null;
    inviteEmail: string;
    status: TeamMemberStatus;
    invitedAt: string;
    joinedAt: string | null;
    // Joined from profiles
    memberName?: string | null;
}

// ─── Customers ───────────────────────────────────────────────────────────────

export interface Customer {
    id: string;
    ownerId: string;
    name: string;
    phone: string | null;
    email: string | null;
    docCount: number;
    createdAt: string;
    updatedAt: string;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export type DashboardPeriod = "today" | "week" | "month" | "year";

export interface DailyRevenue {
    day: string;          // ISO date string
    currency: string;
    docCount: number;
    totalAmount: number;
    type: DocumentType;
}

export interface DashboardMetrics {
    totalRevenue: number;
    totalDocs: number;
    avgDocValue: number;
    topDocType: DocumentType | null;
    periodLabel: string;
    currency: string;
    // vs previous period
    revenueChange: number | null;  // percentage
    docCountChange: number | null; // percentage
}

export interface ActivityItem {
    id: string;
    ownerId: string;
    createdBy: string;
    creatorName: string | null;
    type: DocumentType;
    amount: number;
    currency: string;
    customerName: string | null;
    template: TemplateName;
    createdAt: string;
}

export interface DashboardData {
    metrics: DashboardMetrics;
    chart: DailyRevenue[];
    activity: ActivityItem[];
}