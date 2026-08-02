"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { getHistory, getUserName, saveUserName, extractAmount } from "@/lib/StorageUtils";
import { useAuth } from "@/context/AuthContext";
import { SavedDocument } from "@/lib/types";
import Image from "next/image";
import { formatCurrency, formatDate } from "@/components/templates/TemplateUtils";
import { StaggerContainer, StaggerItem, PageTransition } from "@/components/ui/Animations";
import Script from "next/script";

const jsonLdSchemas = {
  softwareApplication: {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Proofa",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, Android, iOS",
    "description": "Create professional receipts, invoices, and order summaries instantly and share them via WhatsApp. Built for Nigerian entrepreneurs and small businesses.",
    "url": "https://www.proofa.ng",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "NGN"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "120"
    }
  },
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Proofa",
    "url": "https://www.proofa.ng",
    "logo": "https://www.proofa.ng/logo.png",
    "description": "WhatsApp receipt generator for Nigerian small businesses and entrepreneurs.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "NG"
    },
    "sameAs": [
      "https://twitter.com/proofang",
      "https://www.linkedin.com/company/proofa"
    ]
  },
  faqPage: {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is Proofa?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Proofa is a WhatsApp receipt generator that lets Nigerian entrepreneurs create professional receipts, invoices, and order summaries in seconds and share them directly via WhatsApp."
        }
      },
      {
        "@type": "Question",
        "name": "Is Proofa free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Proofa offers a free plan for small businesses. Premium plans with advanced features are available for growing businesses."
        }
      },
      {
        "@type": "Question",
        "name": "How do I send a receipt on WhatsApp with Proofa?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Simply create your receipt using Proofa's online tool, fill in the transaction details, and tap the WhatsApp share button. Your professional receipt will be sent directly to your customer in seconds."
        }
      }
    ]
  }
};

const faqs = [
  {
    question: "What is Proofa?",
    answer: "Proofa is a WhatsApp receipt generator that lets Nigerian entrepreneurs create professional receipts, invoices, and order summaries in seconds and share them directly via WhatsApp."
  },
  {
    question: "Is Proofa free to use?",
    answer: "Proofa offers a free plan for small businesses. Premium plans with advanced features are available for growing businesses."
  },
  {
    question: "How do I send a receipt on WhatsApp with Proofa?",
    answer: "Simply create your receipt using Proofa's online tool, fill in the transaction details, and tap the WhatsApp share button. Your professional receipt will be sent directly to your customer in seconds."
  }
];

const mainActions = [
  {
    id: "receipt",
    title: "Create Receipt",
    subtitle: "Instant payment proof for WhatsApp sales",
    href: "/receipt",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
    subtitle: "Itemized bill with bank details",
    href: "/invoice",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
    subtitle: "Order breakdown for buyers",
    href: "/order",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
    subColor: "text-surface-600",
  },
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [recentHistory, setRecentHistory] = useState<SavedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("User");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setRecentHistory(getHistory().slice(0, 3));
    setUserName(getUserName());
    setIsLoading(false);

    if (typeof window !== "undefined") {
      const isPWA = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
      setIsStandalone(Boolean(isPWA));
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setRecentHistory(getHistory().slice(0, 3));
    setUserName(getUserName());
  }, []);

  const { isPulling, pullDistance, isRefreshing } = usePullToRefresh(handleRefresh);

  const handleEditName = () => {
    setTempName(userName);
    setIsEditingName(true);
  };

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const handleSaveName = () => {
    const finalName = tempName.trim().substring(0, 15) || "User";
    saveUserName(finalName);
    setUserName(finalName);
    setIsEditingName(false);
  };

  const getDocTitle = (doc: SavedDocument) => {
    if (!doc || !doc.data) return "Untitled Document";
    const data = doc.data as any;
    return data.businessName?.trim() || data.customerName?.trim() || "Untitled Document";
  };

  const getDocAmount = (doc: SavedDocument) => {
    if (!doc || !doc.data) return 0;
    return extractAmount(doc.data, doc.type);
  };

  // App Mode vs Unauthenticated Web Marketing Visitor Mode
  const isAppMode = isAuthenticated || isStandalone;

  return (
    <PageTransition>
      <main className="app-container py-6" style={{ overscrollBehaviorY: "contain" }}>
        {/* Pull-to-refresh indicator */}
        {(isPulling || isRefreshing) && (
          <div
            className="flex justify-center items-center overflow-hidden transition-all duration-200"
            style={{ height: isRefreshing ? 48 : pullDistance * 0.6 }}
          >
            <div className={`w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full ${isRefreshing ? "animate-spin" : ""}`}
              style={!isRefreshing ? { transform: `rotate(${pullDistance * 3}deg)`, opacity: Math.min(pullDistance / 60, 1) } : undefined}
            />
          </div>
        )}

        {/* Greeting Section */}
        <section className="mb-6 mt-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 flex-shrink-0 relative">
              <Image
                src="/Logo/Proofa orange icon.png"
                alt="Proofa Icon"
                width={56}
                height={56}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <form
                    onSubmit={(e) => { e.preventDefault(); handleSaveName(); }}
                    className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-300 w-full"
                  >
                    <label htmlFor="user-name-input" className="sr-only">Edit your name</label>
                    <input
                      id="user-name-input"
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value.substring(0, 15))}
                      maxLength={15}
                      aria-label="Edit display name"
                      className="text-2xl font-bold text-primary-600 tracking-tight bg-primary-50 border-b-2 border-primary-500 outline-none min-w-[120px] max-w-[180px] pb-0.5"
                      autoFocus
                      onBlur={handleSaveName}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    />
                    <button
                      type="submit"
                      aria-label="Save display name"
                      title="Save name"
                      className="w-9 h-9 bg-primary-500 text-white rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-all shrink-0"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </button>
                  </form>
                ) : (
                  <div>
                    <h1 className="sr-only">WhatsApp Receipt Generator for Nigerian Businesses</h1>
                    <h2 className="text-2xl font-bold text-surface-900 tracking-tight flex items-center gap-1.5 group">
                      {greeting}, <span className="text-primary-600">{userName}</span>
                      <button
                        onClick={handleEditName}
                        aria-label="Edit display name"
                        title="Edit name"
                        className="p-1.5 opacity-60 hover:opacity-100 hover:bg-surface-100 rounded-full transition-all text-surface-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </h2>
                  </div>
                )}
              </div>
              <p className="text-surface-500 text-xs mt-0.5 font-medium">
                Create &amp; share receipts in 30 seconds.
              </p>
            </div>
          </div>
        </section>

        {/* Marketing Hero (Only shown to Unauthenticated Web Visitors) */}
        {!isAppMode && (
          <section className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <p className="text-surface-600 font-medium leading-relaxed text-xs sm:text-sm">
              <strong className="text-surface-900 font-bold">Proofa is Nigeria&apos;s fastest WhatsApp receipt generator.</strong> Create receipts, invoices, and order summaries in seconds and share directly to WhatsApp.
            </p>
          </section>
        )}

        {/* Main Action Cards */}
        <StaggerContainer>
          <section className="flex flex-col gap-3.5 mb-8">
            {mainActions.map((action) => (
              <StaggerItem key={action.id}>
                <Link
                  href={action.href}
                  className={`${action.bgClass} flex items-center gap-4 p-4 pr-6 rounded-2xl shadow-card transition-all duration-300 active:scale-[0.98] group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                >
                  {/* Glossy overlay */}
                  {action.variant !== 'white' && (
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  )}

                  <div className={`shrink-0 w-14 h-14 rounded-xl ${action.iconBg} flex items-center justify-center`}>
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className={`text-lg font-bold ${action.textColor}`}>
                      {action.title}
                    </h2>
                    <p className={`text-xs ${action.subColor} font-medium mt-0.5 truncate`}>
                      {action.subtitle}
                    </p>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              </StaggerItem>
            ))}
          </section>
        </StaggerContainer>

        {/* Recent Documents Section (Primary App Workspace Anchor) */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-base font-bold text-surface-900">
              Recent Activity
            </h3>
            <Link href="/history" className="text-primary-600 text-xs font-bold uppercase tracking-wider hover:text-primary-700 transition-colors">
              See All
            </Link>
          </div>

          <div className="flex flex-col gap-2.5">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-surface-200/60 p-3.5 rounded-2xl shadow-sm flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-surface-100 animate-pulse shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-surface-200 animate-pulse rounded mb-1.5" />
                    <div className="h-2 w-48 bg-surface-100 animate-pulse rounded" />
                  </div>
                </div>
              ))
            ) : recentHistory.length === 0 ? (
              <div className="bg-surface-50 border-2 border-dashed border-surface-200 rounded-2xl p-6 text-center" aria-live="polite">
                <p className="text-xs font-bold text-surface-500 uppercase tracking-wider">No recent documents</p>
              </div>
            ) : (
              recentHistory.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/${doc.type}?id=${doc.id}`}
                  className="bg-white border border-surface-200/60 p-3.5 rounded-2xl shadow-sm flex items-center gap-3.5 hover:shadow-md hover:border-primary-200 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center p-2 shrink-0 ${doc.type === "receipt" ? "bg-primary-50 text-primary-600" :
                    doc.type === "invoice" ? "bg-secondary-900 text-white" :
                      "bg-surface-100 text-surface-900"
                    }`}>
                    <Image
                      src="/Logo/Proofa orange icon.png"
                      alt="Proofa Icon"
                      width={32}
                      height={32}
                      className="object-contain opacity-90"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-surface-900 text-sm leading-none truncate">
                      {getDocTitle(doc)}
                    </h4>
                    <p className="text-surface-500 text-xs font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1.5 font-mono tabular-nums">
                      {formatCurrency(getDocAmount(doc))} &middot; {formatDate(doc.createdAt)}
                    </p>
                  </div>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-surface-300 shrink-0" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Marketing Showcase Sections (Only for Unauthenticated Web Visitors) */}
        {!isAppMode && (
          <>
            {/* Why Proofa Section */}
            <section className="mb-10">
              <div className="flex flex-col gap-1 mb-4 px-1">
                <h3 className="text-base font-bold text-surface-900">
                  Why Nigerian Businesses Choose Proofa
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-white border border-surface-200/60 p-4 rounded-2xl shadow-sm flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
                    <span className="text-base" aria-hidden="true">📊</span>
                  </div>
                  <p className="text-xs text-surface-600 font-medium leading-relaxed pt-0.5">
                    <strong className="text-surface-900 block mb-0.5">WhatsApp Native</strong>
                    Send receipts directly to WhatsApp without saving PDF files manually.
                  </p>
                </div>
                <div className="bg-white border border-surface-200/60 p-4 rounded-2xl shadow-sm flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
                    <span className="text-base" aria-hidden="true">⚡</span>
                  </div>
                  <p className="text-xs text-surface-600 font-medium leading-relaxed pt-0.5">
                    <strong className="text-surface-900 block mb-0.5">30-Second Receipt Creation</strong>
                    Generate crisp, branded receipts in seconds.
                  </p>
                </div>
                <div className="bg-white border border-surface-200/60 p-4 rounded-2xl shadow-sm flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-surface-100 flex items-center justify-center text-surface-900 shrink-0">
                    <span className="text-base" aria-hidden="true">🇳🇬</span>
                  </div>
                  <p className="text-xs text-surface-600 font-medium leading-relaxed pt-0.5">
                    <strong className="text-surface-900 block mb-0.5">Built for Nigerian SMEs</strong>
                    Full Naira (₦) support and bank vault storage for fast transfers.
                  </p>
                </div>
              </div>
            </section>

            {/* How It Works Section */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4 px-1">
                <h3 className="text-base font-bold text-surface-900">
                  How to Send a Receipt in 3 Steps
                </h3>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3.5 bg-white border border-surface-200/60 p-4 rounded-2xl shadow-sm">
                  <div className="w-7 h-7 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-xs shrink-0 font-mono tabular-nums">1</div>
                  <div>
                    <h4 className="font-bold text-surface-900 text-xs mb-0.5">Fill transaction details</h4>
                    <p className="text-xs text-surface-500 font-medium leading-relaxed">Enter business name, customer name, and item list.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5 bg-white border border-surface-200/60 p-4 rounded-2xl shadow-sm">
                  <div className="w-7 h-7 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-xs shrink-0 font-mono tabular-nums">2</div>
                  <div>
                    <h4 className="font-bold text-surface-900 text-xs mb-0.5">Choose template</h4>
                    <p className="text-xs text-surface-500 font-medium leading-relaxed">Select Receipt, Invoice, or Order Summary layout.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5 bg-white border border-surface-200/60 p-4 rounded-2xl shadow-sm">
                  <div className="w-7 h-7 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-xs shrink-0 font-mono tabular-nums">3</div>
                  <div>
                    <h4 className="font-bold text-surface-900 text-xs mb-0.5">Share on WhatsApp</h4>
                    <p className="text-xs text-surface-500 font-medium leading-relaxed">Tap WhatsApp to send a crisp PNG receipt instantly.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-4 px-1">
                <h3 className="text-base font-bold text-surface-900">
                  Frequently Asked Questions
                </h3>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-white border border-surface-200/60 rounded-2xl p-4 shadow-sm"
                  >
                    <h4 className="text-xs font-bold text-surface-900 mb-1 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                      {faq.question}
                    </h4>
                    <p className="text-xs text-surface-500 font-medium leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA Section */}
            <section className="mt-8 mb-6">
              <div className="bg-secondary-900 p-6 rounded-2xl text-center shadow-md relative overflow-hidden">
                <h2 className="text-base font-bold text-white mb-2">
                  Make your business look professional today
                </h2>
                <p className="text-white/70 text-xs mb-5 font-medium leading-relaxed max-w-xs mx-auto">
                  Over 10,000 Nigerian sellers use Proofa to build trust and get paid faster.
                </p>
                <Link
                  href="/receipt"
                  className="inline-flex w-full bg-primary-500 text-white font-bold py-3 rounded-xl items-center justify-center active:scale-[0.98] transition-all text-xs shadow-md"
                >
                  Create Your First Receipt
                </Link>
              </div>
            </section>
          </>
        )}

        {/* Footer Branding */}
        <footer className="mt-6 text-center pb-8">
          <div className="flex flex-col items-center justify-center">
            <a
              href="https://mudiaga-dev.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-surface-400 hover:text-surface-600 transition-colors inline-block py-1"
            >
              Built by Mudi
            </a>
          </div>
        </footer>

        {/* JSON-LD Schemas */}
        <Script
          id="software-application-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchemas.softwareApplication) }}
        />
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchemas.organization) }}
        />
        <Script
          id="faq-page-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchemas.faqPage) }}
        />
      </main>
    </PageTransition>
  );
}
