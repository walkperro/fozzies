import type { Metadata } from "next";
import { getDefaultContactPayload, isAllowedContactHref, parseContactPayload } from "@/lib/contactSettings";
import { GOLD_UNDERLINE_LINK_CLASS } from "@/lib/linkStyles";
import { getSettingValue } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Fozzie's Dining in Cookeville, Tennessee for private dining inquiries, media, and general questions.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact | Fozzie's Dining",
    description: "Contact Fozzie's Dining in Cookeville, Tennessee for private dining inquiries, media, and general questions.",
    url: "/contact",
    images: [
      {
        url: "/brand/logo_all_1_hq.png",
        alt: "Fozzie's Dining logo",
      },
    ],
  },
  twitter: {
    title: "Contact | Fozzie's Dining",
    description: "Contact Fozzie's Dining in Cookeville, Tennessee for private dining inquiries, media, and general questions.",
    images: ["/brand/logo_all_1_hq.png"],
  },
};

export default async function ContactPage() {
  const defaults = getDefaultContactPayload();
  let contactPayload = defaults;
  const storedContact = await getSettingValue<unknown>("contact_page");
  if (storedContact) {
    const parsed = parseContactPayload(storedContact);
    if (parsed) contactPayload = parsed;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-4xl text-charcoal">{contactPayload.title}</h1>
      {contactPayload.subtitle ? <p className="mt-3 max-w-2xl text-softgray">{contactPayload.subtitle}</p> : null}
      <div className="mt-6 space-y-2 text-softgray">
        {contactPayload.blocks.map((block) => (
          <p key={block.id}>
            {block.label}:{" "}
            {isAllowedContactHref(block.href) ? (
              <a href={block.href} className={GOLD_UNDERLINE_LINK_CLASS}>
                {block.value}
              </a>
            ) : (
              <span>{block.value}</span>
            )}
          </p>
        ))}
      </div>
      {contactPayload.note ? <p className="mt-4 max-w-2xl text-sm text-softgray">{contactPayload.note}</p> : null}
    </main>
  );
}
