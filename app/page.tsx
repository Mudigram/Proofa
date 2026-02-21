"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { getHistory, getUserName, saveUserName } from "@/lib/StorageUtils";
import { SavedDocument } from "@/lib/types";
import { formatCurrency, formatDate } from "@/components/templates/TemplateUtils";
import { StaggerContainer, StaggerItem, PageTransition } from "@/components/ui/Animations";

const mainActions = [
  {
    id: "receipt",
    title: "Create Receipt",
    subtitle: "Quick expense capture",
    href: "/receipt",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
        <path d="M12 17.5v.5" />
        <path d="M12 6v.5" />
      </svg>
    ),
    variant: "orange",
    bgClass: "bg-primary-500 text-white",
    cardBg: "bg-primary-500",
    iconBg: "bg-white/20",
    textColor: "text-white",
    subColor: "text-white/80",
  },
  {
    id: "invoice",
    title: "Create Invoice",
    subtitle: "Professional billing",
    href: "/invoice",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5Z" />
        <path d="m2 17 10 5 10-5" />
        <path d="m2 12 10 5 10-5" />
      </svg>
    ),
    variant: "dark",
    bgClass: "bg-secondary-900 text-white",
    cardBg: "bg-secondary-900",
    iconBg: "bg-white/10",
    textColor: "text-white",
    subColor: "text-white/60",
  },
  {
    id: "order",
    title: "Order Summary",
    subtitle: "Inventory & Sales",
    href: "/order",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="9" y1="9" x2="15" y2="9" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="15" y2="17" />
      </svg>
    ),
    variant: "white",
    bgClass: "bg-white border border-surface-200 text-surface-900",
    cardBg: "bg-white",
    iconBg: "bg-surface-100 text-surface-500",
    textColor: "text-surface-900",
    subColor: "text-surface-400",
  },
];

export default function HomePage() {
  const [recentHistory, setRecentHistory] = useState<SavedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("User");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  useEffect(() => {
    setRecentHistory(getHistory().slice(0, 3));
    setUserName(getUserName());
    setIsLoading(false);
  }, []);

  const handleEditName = () => {
    setTempName(userName);
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    const finalName = tempName.trim() || "User";
    saveUserName(finalName);
    setUserName(finalName);
    setIsEditingName(false);
  };

  const getDocTitle = (doc: SavedDocument) => {
    const data = doc.data as any;
    return data.businessName || data.customerName || "Untitled";
  };

  const getDocAmount = (doc: SavedDocument) => {
    const data = doc.data as any;
    if (doc.type === "receipt") return data.amount;
    if (doc.type === "order") return data.totalAmount;
    if (doc.type === "invoice") {
      const subtotal = data.items?.reduce((acc: number, item: any) => acc + (item.quantity * item.price), 0) || 0;
      return subtotal * 1.075;
    }
    return 0;
  };

  return (
    <PageTransition>
      <main className="app-container py-6">
        {/* Greeting Section */}
        <section className="mb-8 mt-2">
          <div className="flex items-center gap-3">
            {isEditingName ? (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value.substring(0, 5))}
                  className="text-3xl font-extrabold text-primary-600 tracking-tight bg-primary-50 border-b-2 border-primary-500 outline-none w-[120px] pb-1"
                  autoFocus
                  onBlur={handleSaveName}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                />
                <button
                  onClick={handleSaveName}
                  className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <h1 className="text-3xl font-extrabold text-surface-900 tracking-tight flex items-center gap-1.5 group">
                Good Morning, <span className="text-primary-600">{userName}</span>
                <button
                  onClick={handleEditName}
                  className="p-2 opacity-40 hover:opacity-100 hover:bg-surface-900 rounded-full transition-all text-surface-400"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </h1>
            )}
          </div>
          <p className="text-surface-500 text-base mt-1.5 font-medium">
            Ready to create a new document?
          </p>
        </section>

        {/* Main Action Cards */}
        <StaggerContainer>
          <section className="flex flex-col gap-4 mb-10">
            {mainActions.map((action) => (
              <StaggerItem key={action.id}>
                <Link
                  href={action.href}
                  className={`${action.bgClass} flex items-center gap-5 p-5 pr-8 rounded-3xl shadow-card transition-all duration-300 active:scale-[0.98] group relative overflow-hidden`}
                >
                  {/* Glossy overlay for colored cards */}
                  {action.variant !== 'white' && (
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  )}

                  <div className={`flex-shrink-0 w-16 h-16 rounded-2xl ${action.iconBg} flex items-center justify-center`}>
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className={`text-xl font-bold ${action.textColor}`}>
                      {action.title}
                    </h2>
                    <p className={`text-sm ${action.subColor} font-medium mt-0.5`}>
                      {action.subtitle}
                    </p>
                  </div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              </StaggerItem>
            ))}
          </section>
        </StaggerContainer>

        {/* Recent Documents */}
        <section className="pb-20">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-xl font-bold text-surface-900">
              Recent Activity
            </h3>
            <Link href="/history" className="text-primary-600 text-[10px] font-black uppercase tracking-widest">
              See All
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {!isLoading && recentHistory.length === 0 ? (
              <div className="bg-surface-50 border-2 border-dashed border-surface-100 rounded-[2rem] p-8 text-center">
                <p className="text-xs font-bold text-surface-300 uppercase tracking-widest">No recent documents</p>
              </div>
            ) : (
              recentHistory.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/${doc.type}?id=${doc.id}`}
                  className="bg-white border border-surface-100 p-4 rounded-3xl shadow-sm flex items-center gap-4 hover:shadow-md hover:border-primary-100 transition-all active:scale-[0.98]"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${doc.type === "receipt" ? "bg-orange-50 text-orange-500" :
                    doc.type === "invoice" ? "bg-blue-50 text-blue-500" :
                      "bg-purple-50 text-purple-500"
                    }`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-surface-900 leading-none truncate">
                      {getDocTitle(doc)}
                    </h4>
                    <p className="text-surface-400 text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center gap-1.5">
                      {formatCurrency(getDocAmount(doc))} &middot; {formatDate(doc.createdAt)}
                    </p>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-surface-300">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* CTA Section - Briefly mirrored from How it Works for conversion */}
        <section className="mt-12">
          <div className="bg-gradient-to-br from-secondary-900 to-secondary-950 p-7 rounded-[32px] text-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl" />
            <h2 className="text-xl font-bold text-white mb-3">
              Ready to boost productivity?
            </h2>
            <p className="text-white/50 text-xs mb-6 font-medium">
              Join thousands of professionals using Proofa to streamline documentation.
            </p>
            <Link
              href="/how-it-works"
              className="inline-flex w-full bg-primary-500 text-white font-bold py-3.5 rounded-xl items-center justify-center active:scale-[0.98] transition-all text-sm"
            >
              See How it Works
            </Link>
          </div>
        </section>

        {/* Footer Branding */}
        <footer className="mt-12 text-center">
          <div className="flex items-center justify-center gap-2 text-surface-300 mb-6">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-widest">Proofa</span>
          </div>
        </footer>
      </main>
    </PageTransition>
  );
}
