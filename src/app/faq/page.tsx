import type { Metadata } from "next";
import { getDefaultFaqPayload, parseFaqPayload } from "@/lib/faqSettings";
import { getSettingValue } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Read frequently asked questions about dining at Fozzie's Dining in Cookeville, Tennessee.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "FAQ | Fozzie's Dining",
    description: "Read frequently asked questions about dining at Fozzie's Dining in Cookeville, Tennessee.",
    url: "/faq",
    images: [
      {
        url: "/brand/logo_all_1_hq.png",
        alt: "Fozzie's Dining logo",
      },
    ],
  },
  twitter: {
    title: "FAQ | Fozzie's Dining",
    description: "Read frequently asked questions about dining at Fozzie's Dining in Cookeville, Tennessee.",
    images: ["/brand/logo_all_1_hq.png"],
  },
};

export default async function FAQPage() {
  const defaults = getDefaultFaqPayload();
  let faqPayload = defaults;
  const storedFaq = await getSettingValue<unknown>("faq_page");
  if (storedFaq) {
    const parsed = parseFaqPayload(storedFaq);
    if (parsed) faqPayload = parsed;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-4xl text-charcoal">{faqPayload.title}</h1>
      {faqPayload.subtitle ? <p className="mt-3 max-w-2xl text-softgray">{faqPayload.subtitle}</p> : null}
      <div className="mt-8 space-y-6">
        {faqPayload.sections.map((section) => (
          <section key={section.id} className="space-y-4">
            <h2 className="font-serif text-2xl text-charcoal">{section.heading}</h2>
            <div className="space-y-6">
              {section.items.map((item) => (
                <div key={item.id}>
                  <div className="font-medium text-charcoal">{item.question}</div>
                  <div className="mt-1 space-y-1 text-softgray">
                    {item.answer.split("\n").map((line, idx) => (
                      <p key={`${item.id}-${idx}`}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
