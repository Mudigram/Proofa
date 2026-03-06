import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono, Outfit } from "next/font/google";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"

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
  title: "Proofa — Send Your Receipt on WhatsApp in Seconds",
  description:
    "Create sharp, professional receipts, invoices, and order summaries instantly — and share them straight to WhatsApp. Built for Nigerian entrepreneurs, traders, and small businesses.",
  keywords: [
    "receipt generator Nigeria",
    "invoice generator Nigeria",
    "WhatsApp receipt sender",
    "proof of payment Nigeria",
    "business receipt maker",
    "Nigerian SME invoice",
    "order summary generator",
    "payment receipt WhatsApp",
    "small business Nigeria",
    "e-receipt Nigeria",
    "online invoice maker",
    "Lagos business tools",
  ],
  authors: [{ name: "Proofa Team" }],
  openGraph: {
    title: "Proofa — Fast, Professional Business Documents",
    description: "Create and share receipts, invoices, and order summaries in seconds. Optimized for mobile and WhatsApp.",
    url: "https://proofa.ng",
    siteName: "Proofa",
    images: [
      {
        url: "/Logo/Proofa orange icon.png",
        width: 1200,
        height: 630,
        alt: "Proofa Logo",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  icons: {
    icon: "/Logo/Proofa orange icon.png",
    apple: "/Logo/Proofa orange icon.png",
  },
  manifest: "/manifest.json",
  twitter: {
    card: "summary_large_image",
    title: "Proofa — Mobile Receipt & Invoice Generator",
    description: "Professionalize your business documentation instantly with Proofa.",
    images: ["/Logo/Proofa orange icon.png"],
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
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} ${geistMono.variable} pb-20`}>

        <AuthProvider>
          <ToastProvider>
            <Header />
            {children}
            <BottomNav />
          </ToastProvider>
          <Analytics />
        </AuthProvider>

      </body>
    </html>
  );
}

