"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { track } from "@/lib/trackClient";

const VISITOR_KEY = "fozzies_visitor_id";

function getDeviceType(userAgent: string): "mobile" | "desktop" | "tablet" | "unknown" {
  const ua = userAgent.toLowerCase();
  if (!ua) return "unknown";
  if (/ipad|tablet|kindle|silk|playbook/.test(ua)) return "tablet";
  if (/mobi|iphone|android/.test(ua)) return "mobile";
  return "desktop";
}

function getVisitorId() {
  if (typeof window === "undefined") return "";
  try {
    const existing = window.localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;

    const generated =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(VISITOR_KEY, generated);
    return generated;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

function getReferrer() {
  if (typeof document === "undefined") return "";
  const value = document.referrer || "";
  if (!value) return "";
  return value.slice(0, 1000);
}

export default function TrackingPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    const query = params.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";

    track("page_view", {
      page_path: pagePath.slice(0, 500),
      referrer: getReferrer(),
      utm_source: (params.get("utm_source") || "").slice(0, 120),
      utm_medium: (params.get("utm_medium") || "").slice(0, 120),
      utm_campaign: (params.get("utm_campaign") || "").slice(0, 160),
      utm_term: (params.get("utm_term") || "").slice(0, 160),
      utm_content: (params.get("utm_content") || "").slice(0, 160),
      visitor_id: getVisitorId().slice(0, 120),
      user_agent: userAgent.slice(0, 400),
      device: getDeviceType(userAgent),
    });
  }, [pathname, searchParams]);

  return null;
}
