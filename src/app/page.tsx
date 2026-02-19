import type { Metadata } from "next";
import HomePageClient from "@/components/HomePageClient";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fozziesdining.com";

export const metadata: Metadata = {
  title: "Fine Dining in Cookeville, TN",
  description:
    "Discover fine dining in Cookeville, Tennessee at Fozzie's Dining with chef-driven seasonal menus, polished service, and evening reservations.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Fine Dining in Cookeville, TN | Fozzie's Dining",
    description:
      "Discover fine dining in Cookeville, Tennessee at Fozzie's Dining with chef-driven seasonal menus and refined hospitality.",
    url: "/",
    images: [
      {
        url: "/brand/logo_all_1_hq.png",
        alt: "Fozzie's Dining logo",
      },
    ],
  },
  twitter: {
    title: "Fine Dining in Cookeville, TN | Fozzie's Dining",
    description:
      "Discover fine dining in Cookeville, Tennessee at Fozzie's Dining with chef-driven seasonal menus and refined hospitality.",
    images: ["/brand/logo_all_1_hq.png"],
  },
};

const homeJsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Fozzie's Dining",
  url: siteUrl,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Cookeville",
    addressRegion: "TN",
    addressCountry: "US",
  },
  servesCuisine: ["Southern", "Mediterranean", "Asian", "Cajun", "Hispanic"],
  sameAs: ["https://instagram.com/fozziesdining"],
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }} />
      <HomePageClient />
    </>
  );
}
