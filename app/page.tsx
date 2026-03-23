"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getHistory, deleteDocument, getUserName, saveUserName } from "@/lib/StorageUtils";

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

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

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
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 flex-shrink-0 animate-in fade-in zoom-in duration-500 relative">
              <Image
                src="/Logo/Proofa orange icon.png"
                alt="Proofa Icon"
                width={64}
                height={64}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value.substring(0, 10))}
                      className="text-3xl font-extrabold text-primary-600 tracking-tight bg-primary-50 border-b-2 border-primary-500 outline-none w-[160px] pb-1"
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
                  <div>
                    <h1 className="sr-only">WhatsApp Receipt Generator for Nigerian Businesses</h1>
                    <h2 className="text-3xl font-extrabold text-surface-900 tracking-tight flex items-center gap-1.5 group">
                      {greeting}, <span className="text-primary-600">{userName}</span>
                      <button
                        onClick={handleEditName}
                        className="p-2 opacity-40 hover:opacity-100 hover:bg-surface-900 rounded-full transition-all text-surface-400"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </h2>
                  </div>
                )}
              </div>
              <p className="text-surface-500 text-base mt-1.5 font-medium">
                Ready to create a new document?
              </p>
            </div>
          </div>
        </section>

        {/* SEO Hero Section */}
        <section className="mb-10 text-center sm:text-left animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          <p className="text-surface-600 font-medium leading-relaxed max-w-2xl text-[15px]">
            <strong className="text-surface-900 font-bold">Proofa is Nigeria's fastest WhatsApp receipt generator.</strong> Create professional receipts, invoices, and order summaries in under 30 seconds — then share them directly to any WhatsApp contact. Over 10,000 Nigerian traders, market vendors, and small business owners use Proofa daily to look professional and get paid faster.
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

        {/* Why Proofa Section */}
        <section className="mb-12 mt-6">
          <div className="flex flex-col gap-2 mb-6 px-1">
            <h3 className="text-xl font-bold text-surface-900">
              Why Nigerian Businesses Choose Proofa
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-surface-100 p-5 rounded-3xl shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-primary-500 shrink-0">
                <span className="text-lg">📊</span>
              </div>
              <p className="text-sm text-surface-600 font-medium leading-relaxed pt-1">
                <strong className="text-surface-900 block mb-0.5">WhatsApp Dominance</strong>
                Over 67% of Nigerian SMEs use WhatsApp as their primary customer communication channel.
              </p>
            </div>
            <div className="bg-white border border-surface-100 p-5 rounded-3xl shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                <span className="text-lg">⚡</span>
              </div>
              <p className="text-sm text-surface-600 font-medium leading-relaxed pt-1">
                <strong className="text-surface-900 block mb-0.5">Lightning Fast</strong>
                Average document creation time: under 30 seconds.
              </p>
            </div>
            <div className="bg-white border border-surface-100 p-5 rounded-3xl shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 shrink-0">
                <span className="text-lg">🧾</span>
              </div>
              <p className="text-sm text-surface-600 font-medium leading-relaxed pt-1">
                <strong className="text-surface-900 block mb-0.5">Versatile Documents</strong>
                Create 3 document types: Receipts, Invoices, and Order Summaries.
              </p>
            </div>
            <div className="bg-white border border-surface-100 p-5 rounded-3xl shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500 shrink-0">
                <span className="text-lg">🇳🇬</span>
              </div>
              <p className="text-sm text-surface-600 font-medium leading-relaxed pt-1">
                <strong className="text-surface-900 block mb-0.5">Built for Nigeria</strong>
                Works on any device (no app needed), with full Naira (₦) support for the local market.
              </p>
            </div>
          </div>
        </section>

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
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-surface-100 p-4 rounded-3xl shadow-sm flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-surface-50 animate-pulse shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-surface-200 animate-pulse rounded mb-2" />
                    <div className="h-2 w-48 bg-surface-100 animate-pulse rounded" />
                  </div>
                </div>
              ))
            ) : recentHistory.length === 0 ? (
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
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center p-2 ${doc.type === "receipt" ? "bg-orange-50" :
                    doc.type === "invoice" ? "bg-blue-50" :
                      "bg-purple-50"
                    }`}>
                    <Image
                      src="/Logo/Proofa orange icon.png"
                      alt="Proofa"
                      width={40}
                      height={40}
                      className="object-contain opacity-90"
                    />
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

        {/* How It Works Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6 px-1">
            <h3 className="text-xl font-bold text-surface-900">
              How to Send a Receipt in 3 Steps
            </h3>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4 bg-white border border-surface-100 p-5 rounded-3xl shadow-sm">
              <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
              <div>
                <h4 className="font-bold text-surface-900 mb-1">Fill in your details</h4>
                <p className="text-sm text-surface-500 font-medium">Enter your business name, customer info, and transaction amount.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white border border-surface-100 p-5 rounded-3xl shadow-sm">
              <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
              <div>
                <h4 className="font-bold text-surface-900 mb-1">Choose your template</h4>
                <p className="text-sm text-surface-500 font-medium">Pick from receipt, invoice, or order summary formats.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white border border-surface-100 p-5 rounded-3xl shadow-sm">
              <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-sm shrink-0">3</div>
              <div>
                <h4 className="font-bold text-surface-900 mb-1">Share on WhatsApp</h4>
                <p className="text-sm text-surface-500 font-medium">Tap the WhatsApp button and your professional document is sent instantly.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6 px-1">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-surface-900">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-surface-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group"
              >
                <h4 className="text-base font-bold text-surface-900 mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0 group-hover:scale-150 transition-transform" />
                  {faq.question}
                </h4>
                <p className="text-sm text-surface-500 font-medium leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust Signals Section */}
        <section className="mb-10 px-1">
          <h3 className="text-lg font-bold text-surface-900 mb-4 text-center">
            Trusted by Nigerian Entrepreneurs
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="bg-surface-100 text-surface-600 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">Fashion Vendors</span>
            <span className="bg-surface-100 text-surface-600 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">Food Delivery</span>
            <span className="bg-surface-100 text-surface-600 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">Freelancers</span>
            <span className="bg-surface-100 text-surface-600 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">Online Traders</span>
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
        <footer className="mt-4 text-center pb-8">
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="flex items-center text-surface-900">
              <Image
                src="/Logo/Proofa orange icon.png"
                alt="Proofa Icon"
                width={80}
                height={80}
                className="object-contain"
              />
              <span className="text-base font-bold uppercase tracking-widest">Proofa</span>
            </div>
            <a
              href="https://mudiaga-dev.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] hover:text-primary-500 transition-colors flex items-center gap-1.5"
            >
              Built with <span className="text-red-500 animate-pulse">❤️</span> by Mudi
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
