import type { Metadata } from "next";

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

export default function FAQPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-4xl text-charcoal">FAQ</h1>
      <div className="mt-8 space-y-6">
        <div>
          <div className="font-medium text-charcoal">Dress code</div>
          <div className="mt-1 text-softgray">Smart casual. Jackets welcome but not required.</div>
        </div>
        <div>
          <div className="font-medium text-charcoal">Reservations</div>
          <div className="mt-1 text-softgray">Reservations recommended, especially weekends and special occasions.</div>
        </div>
      </div>
    </main>
  );
}
