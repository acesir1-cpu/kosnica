import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Košnica.ba - Med za one koji znaju razliku",
    template: "%s | Košnica.ba",
  },
  description: "Prirodno proizveden med, bez dodataka, direktno od pčelara. Otkrijte razliku kvalitetnog meda.",
  keywords: ["med", "pčelarstvo", "prirodni med", "košnica", "bosna", "hercegovina"],
  authors: [{ name: "Košnica.ba" }],
  creator: "Košnica.ba",
  publisher: "Košnica.ba",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "bs_BA",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    siteName: "Košnica.ba",
    title: "Košnica.ba - Med za one koji znaju razliku",
    description: "Prirodno proizveden med, bez dodataka, direktno od pčelara.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Košnica.ba - Med za one koji znaju razliku",
    description: "Prirodno proizveden med, bez dodataka, direktno od pčelara.",
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
};

import Header from '@/components/Header';
import ChatWidget from '@/components/ChatWidget';
import CookiesBanner from '@/components/CookiesBanner';
import ScrollToTop from '@/components/ScrollToTop';
import { ToastProvider } from '@/components/ToastProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bs">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} ${inter.variable} antialiased`}
      >
        <ToastProvider>
          <ScrollToTop />
          <Header />
          <main>{children}</main>
          <ChatWidget />
          <CookiesBanner />
        </ToastProvider>
      </body>
    </html>
  );
}
