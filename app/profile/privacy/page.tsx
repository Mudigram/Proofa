"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ChevronLeft, ShieldCheck, Download, Trash2, Database, Lock } from "lucide-react";

export default function DataPrivacyPage() {
    const { isBusiness, signOut } = useAuth();
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you sure you want to permanently delete your account and all data? This cannot be undone.")) return;
        
        setIsDeleting(true);
        try {
            const res = await fetch("/api/user/delete", { method: "DELETE" });
            if (res.ok) {
                await signOut();
                router.push("/");
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete account");
                setIsDeleting(false);
            }
        } catch (error) {
            alert("An error occurred");
            setIsDeleting(false);
        }
    };

    return (
        <main className="app-container min-h-screen pb-32 pt-8">
            <header className="mb-6">
                <Link
                    href="/profile"
                    className="inline-flex items-center text-surface-500 hover:text-surface-900 transition-colors mb-4"
                >
                    <ChevronLeft size={20} className="mr-1" />
                    Back to Profile
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-surface-100 text-surface-600 rounded-xl flex items-center justify-center">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-surface-900 tracking-tight">Data & Privacy</h1>
                        <p className="text-sm text-surface-500 font-medium mt-0.5">Manage your data and understand your rights</p>
                    </div>
                </div>
            </header>

            <div className="space-y-6">
                {/* Data Actions */}
                <section className="bg-white rounded-[2rem] p-6 shadow-xl shadow-surface-200/5 border border-surface-100">
                    <h2 className="text-lg font-bold text-surface-900 mb-4 tracking-tight flex items-center gap-2">
                        <Database size={18} className="text-primary-500" />
                        Data Management
                    </h2>
                    
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-surface-100 rounded-2xl bg-surface-50">
                            <div>
                                <h3 className="font-bold text-surface-900 text-sm">Export Your Data</h3>
                                <p className="text-xs text-surface-500 mt-1">Download a copy of all your receipts, invoices, and settings in JSON format.</p>
                            </div>
                            {isBusiness ? (
                                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-surface-200 text-surface-700 font-bold text-sm rounded-xl hover:bg-surface-100 transition-colors active:scale-95 whitespace-nowrap">
                                    <Download size={16} />
                                    Request Export
                                </button>
                            ) : (
                                <Link href="/pricing" className="flex items-center justify-center gap-2 px-4 py-2 bg-surface-100 border border-surface-200 text-surface-500 font-bold text-[11px] uppercase tracking-wider rounded-xl hover:bg-surface-200 transition-colors active:scale-95 whitespace-nowrap">
                                    <Lock size={14} />
                                    Business Plan
                                </Link>
                            )}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-red-100 rounded-2xl bg-red-50/50">
                            <div>
                                <h3 className="font-bold text-red-700 text-sm">Delete Account</h3>
                                <p className="text-xs text-red-500/80 mt-1">Permanently remove your account and all associated data from our servers.</p>
                            </div>
                            <button 
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                                className={`flex items-center justify-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 font-bold text-sm rounded-xl hover:bg-red-50 transition-colors active:scale-95 whitespace-nowrap ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        Delete Data
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Privacy Policy Document */}
                <section className="bg-white rounded-[2rem] p-6 md:p-8 shadow-xl shadow-surface-200/5 border border-surface-100">
                    <div className="prose prose-sm prose-surface max-w-none">
                        <h2 className="text-lg font-bold text-surface-900 mb-4 tracking-tight border-b border-surface-100 pb-4">
                            Privacy Policy & Data Processing Agreement
                        </h2>
                        
                        <div className="space-y-6 text-sm text-surface-600 leading-relaxed">
                            <div>
                                <h3 className="font-bold text-surface-900 text-base mb-2">1. Information Collection</h3>
                                <p>
                                    As part of delivering our invoicing and receipt generation services, we process functional business data including your entity name, contact parameters, banking coordinates, and transaction logs. Furthermore, the platform captures the personally identifiable information (PII) of your end-customers purely for document formulation purposes.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-bold text-surface-900 text-base mb-2">2. Data Utilization and Scope</h3>
                                <p>
                                    Our processing of captured data is strictly limited to the execution and provisioning of the platform&apos;s primary features—specifically the generation, storage, and retrieval of your financial documentation. Your information is isolated and is never utilized for secondary marketing, nor sold to third-party data brokers.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-bold text-surface-900 text-base mb-2">3. Storage, Retention & Cryptography</h3>
                                <p>
                                    All relational data is secured using AES-256 encryption at rest and TLS 1.2+ for in-transit transmission. Our database infrastructure operates under stringent access controls via Row-Level Security (RLS) policies, ensuring cryptographic isolation between distinct tenant records. We maintain data records solely for the duration of your active account subscription.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-bold text-surface-900 text-base mb-2">4. Third-Party Processors</h3>
                                <p>
                                    In adherence to standard data handling regulations, we utilize industry-compliant cloud infrastructure providers. These sub-processors operate under stringent Data Processing Agreements (DPAs) binding them to the same operational security standards maintained by our primary application.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-bold text-surface-900 text-base mb-2">5. User Rights and Compliance</h3>
                                <p>
                                    In alignment with regional privacy frameworks, users retain sole ownership of their data. You are entitled to granular access, right to rectification, restricted processing, and the right to complete erasure. Use the data management tools provided on this interface to execute standardized export or deletion operations.
                                </p>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-surface-100 text-xs text-surface-400">
                            Last updated: Compliance Revision 1.0 (March 2026)
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
