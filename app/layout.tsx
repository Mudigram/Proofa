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
  metadataBase: new URL("https://www.proofa.ng"),
  title: "Free Receipt & Invoice Generator in Nigeria | Proofa",
  description: "Generate professional receipts & invoices in seconds. Download or share directly on WhatsApp, Instagram & TikTok. Free for Nigerian businesses.",
  keywords: [
    "receipt generator Nigeria",
    "invoice generator Nigeria",
    "generator receipt in nigeria",
    "free receipt generator nigeria",
    "receipt maker Lagos",
    "WhatsApp receipt sender",
    "Instagram vendor receipt generator",
    "TikTok shop receipt Nigeria",
    "proof of payment Nigeria",
    "business receipt maker",
    "Nigerian SME invoice",
    "order summary generator",
    "e-receipt Nigeria",
    "online invoice maker",
    "Lagos business tools",
  ],
  authors: [{ name: "Proofa Team" }],
  openGraph: {
    title: "Free Receipt & Invoice Generator in Nigeria | Proofa",
    description: "Generate professional receipts & invoices in seconds. Download or share directly on WhatsApp, Instagram & TikTok. Free for Nigerian businesses.",
    url: "https://www.proofa.ng",
    siteName: "Proofa",
    images: [
      {
        url: "/videos/proofa-video-thumb.jpg",
        width: 1080,
        height: 1920,
        alt: "Proofa - Free Receipt & Invoice Generator in Nigeria",
      },
      {
        url: "/Logo/Proofa orange icon.png",
        width: 1200,
        height: 630,
        alt: "Proofa - Free Receipt & Invoice Generator in Nigeria",
      },
    ],
    videos: [
      {
        url: "https://www.proofa.ng/videos/proofa-explainer.mp4",
        secureUrl: "https://www.proofa.ng/videos/proofa-explainer.mp4",
        type: "video/mp4",
        width: 1080,
        height: 1920,
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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
  alternates: {
    canonical: "./",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "geo.region": "NG-LA",
    "geo.placename": "Lagos, Nigeria",
    "geo.position": "6.5244;3.3792",
    "ICBM": "6.5244, 3.3792",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Receipt & Invoice Generator in Nigeria | Proofa",
    description: "Generate professional receipts & invoices in seconds. Download or share directly on WhatsApp, Instagram & TikTok. Free for Nigerian businesses.",
    images: ["/videos/proofa-video-thumb.jpg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Proofa",
  },
  formatDetection: {
    telephone: false, // Prevents iOS from aggressively highlighting account numbers as phone links
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import NetworkToast from "@/components/NetworkToast";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import InstallPwaBanner from "@/components/InstallPwaBanner";
import { InAppBrowserBanner } from "@/components/ui/InAppBrowserBanner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          Applies the stored theme before first paint. Without this the page
          renders light, then flips to dark once ThemeProvider's effect runs.
          Kept inline and dependency-free so it executes render-blocking.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("proofa_theme");if(t!=="dark"&&t!=="light"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}if(t==="dark"){document.documentElement.classList.add("dark")}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${outfit.variable} ${geistMono.variable} pb-20 transition-colors duration-200`}>

        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <ServiceWorkerRegister />
              <NetworkToast />
              <InAppBrowserBanner />
              <InstallPwaBanner />
              <Header />
              {children}
              <BottomNav />
            </ToastProvider>
            <Analytics />
          </AuthProvider>
        </ThemeProvider>

      </body>
    </html>
  );
}
