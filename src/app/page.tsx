import type { Metadata } from "next";
import HomePageClient from "@/components/HomePageClient";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fozziesdining.com";

export const metadata: Metadata = {
  title: "Chef-Driven Dining in Cookeville, TN",
  description: "Fozzie's Dining offers elevated chef-driven meals, seasonal dishes, and reservations in Cookeville, Tennessee.",
  openGraph: {
    title: "Fozzie's Dining",
    description: "Elevated, chef-driven dining in Cookeville, Tennessee.",
    url: siteUrl,
  },
  twitter: {
    title: "Fozzie's Dining",
    description: "Elevated, chef-driven dining in Cookeville, Tennessee.",
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
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "16:00",
      closes: "21:00",
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }} />
      <HomePageClient />
    </>
  );
}
