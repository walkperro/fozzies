"use client";

import { useMemo, useState } from "react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fozziesdining.com";
const BASE_PATHS = ["/", "/menu", "/contact", "/join-the-team", "/reserve"];

function fallbackCopy(value: string) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export default function UtmLinkBuilder() {
  const [basePath, setBasePath] = useState("/");
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [utmContent, setUtmContent] = useState("");
  const [utmTerm, setUtmTerm] = useState("");
  const [copied, setCopied] = useState(false);

  const generatedUrl = useMemo(() => {
    if (!utmSource.trim() || !utmMedium.trim() || !utmCampaign.trim()) return "";
    const url = new URL(basePath, SITE_URL);
    url.searchParams.set("utm_source", utmSource.trim());
    url.searchParams.set("utm_medium", utmMedium.trim());
    url.searchParams.set("utm_campaign", utmCampaign.trim());
    if (utmContent.trim()) url.searchParams.set("utm_content", utmContent.trim());
    if (utmTerm.trim()) url.searchParams.set("utm_term", utmTerm.trim());
    return url.toString();
  }, [basePath, utmSource, utmMedium, utmCampaign, utmContent, utmTerm]);

  async function copyLink() {
    if (!generatedUrl) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(generatedUrl);
      } else {
        fallbackCopy(generatedUrl);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="min-w-0 w-full max-w-full border border-charcoal/10 bg-ivory p-5">
      <h3 className="font-serif text-2xl text-charcoal">UTM Link Builder</h3>
      <p className="mt-2 text-sm text-softgray">
        Use this link when posting on Instagram, flyers, email, etc — so you can see where visits came from.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs tracking-[0.16em] text-softgray">
          BASE PAGE
          <select
            value={basePath}
            onChange={(e) => setBasePath(e.target.value)}
            className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-sm text-charcoal outline-none"
          >
            {BASE_PATHS.map((path) => (
              <option key={path} value={path}>
                {path}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs tracking-[0.16em] text-softgray">
          UTM SOURCE *
          <input
            value={utmSource}
            onChange={(e) => setUtmSource(e.target.value)}
            className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-sm text-charcoal outline-none"
            placeholder="instagram"
          />
        </label>
        <label className="text-xs tracking-[0.16em] text-softgray">
          UTM MEDIUM *
          <input
            value={utmMedium}
            onChange={(e) => setUtmMedium(e.target.value)}
            className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-sm text-charcoal outline-none"
            placeholder="social"
          />
        </label>
        <label className="text-xs tracking-[0.16em] text-softgray">
          UTM CAMPAIGN *
          <input
            value={utmCampaign}
            onChange={(e) => setUtmCampaign(e.target.value)}
            className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-sm text-charcoal outline-none"
            placeholder="spring_launch"
          />
        </label>
        <label className="text-xs tracking-[0.16em] text-softgray">
          UTM CONTENT
          <input
            value={utmContent}
            onChange={(e) => setUtmContent(e.target.value)}
            className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-sm text-charcoal outline-none"
            placeholder="story_link"
          />
        </label>
        <label className="text-xs tracking-[0.16em] text-softgray">
          UTM TERM
          <input
            value={utmTerm}
            onChange={(e) => setUtmTerm(e.target.value)}
            className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-sm text-charcoal outline-none"
            placeholder="fine_dining"
          />
        </label>
      </div>

      <div className="mt-4 min-w-0 w-full max-w-full rounded-md border border-charcoal/15 bg-cream px-3 py-2 text-sm text-charcoal break-all">
        {generatedUrl || "Fill source, medium, and campaign to generate a shareable tracking link."}
      </div>

      <button
        type="button"
        disabled={!generatedUrl}
        onClick={() => void copyLink()}
        className="mt-3 rounded-full border border-charcoal/20 bg-cream px-4 py-2 text-xs text-charcoal transition hover:bg-charcoal/5 disabled:opacity-70"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </section>
  );
}
