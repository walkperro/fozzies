import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fozziesdining.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const routes = [
    "/",
    "/menu",
    "/about",
    "/faq",
    "/contact",
    "/join-the-team",
    "/privacy",
    "/best-fine-dining-cookeville",
    "/romantic-dinner-cookeville",
    "/private-dining-cookeville",
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
  }));
}
