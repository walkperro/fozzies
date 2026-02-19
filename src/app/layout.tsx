import "@fontsource/playfair-display/600.css";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import TrackingPixel from "@/components/TrackingPixel";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import "@fontsource/inter/400.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fozziesdining.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Fozzie's Dining",
    template: "%s | Fozzie's Dining",
  },
  description: "Chef-driven dining in Cookeville, Tennessee with seasonal menus, warm hospitality, and elevated service.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Fozzie's Dining",
    title: "Fozzie's Dining",
    description: "Chef-driven dining in Cookeville, Tennessee with seasonal menus, warm hospitality, and elevated service.",
    images: [
      {
        url: "/brand/logo_all_1_hq.png",
        alt: "Fozzie's Dining",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fozzie's Dining",
    description: "Chef-driven dining in Cookeville, Tennessee with seasonal menus, warm hospitality, and elevated service.",
    images: ["/brand/logo_all_1_hq.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        {gaMeasurementId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}', { anonymize_ip: true, send_page_view: false });
              `}
            </Script>
          </>
        ) : null}
        <AnalyticsTracker />
        <Suspense fallback={null}>
          <TrackingPixel />
        </Suspense>
        <div className="flex-1">
          <Header />
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
