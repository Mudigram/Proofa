import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono, Outfit } from "next/font/google";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Proofa — Professional Receipt & Invoice Generator",
  description:
    "Generate clean, modern receipts, invoices, and order summaries instantly. Optimized for WhatsApp sharing. The #1 document generator for Nigerian SMEs and entrepreneurs.",
  keywords: [
    "receipt generator",
    "invoice generator",
    "WhatsApp receipt",
    "proof of payment",
    "Nigerian business",
    "payment receipt",
    "order summary",
    "mobile billing",
  ],
  authors: [{ name: "Proofa Team" }],
  openGraph: {
    title: "Proofa — Fast, Professional Business Documents",
    description: "Create and share receipts, invoices, and order summaries in seconds. Optimized for mobile and WhatsApp.",
    url: "https://proofa.app", // Placeholder
    siteName: "Proofa",
    locale: "en_NG",
    type: "website",
  },
  manifest: "/manifest.json",
  twitter: {
    card: "summary_large_image",
    title: "Proofa — Mobile Receipt & Invoice Generator",
    description: "Professionalize your business documentation instantly with Proofa.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#e8590c",
};

import { ToastProvider } from "@/components/ui/Toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} ${geistMono.variable} pb-20`}>
        <ToastProvider>
          <Header />
          {children}
          <BottomNav />
        </ToastProvider>
      </body>
    </html>
  );
}
