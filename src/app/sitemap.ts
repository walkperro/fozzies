import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fozziesdining.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const routes = ["/", "/menu", "/about", "/faq", "/contact", "/join-the-team", "/privacy"];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
  }));
}
