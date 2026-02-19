import type { Metadata } from "next";

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

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-4xl text-charcoal">Contact</h1>
      <p className="mt-3 max-w-2xl text-softgray">
        For private dining inquiries, media, or general questions.
      </p>
      <div className="mt-6 space-y-2 text-softgray">
        <p>
          Email:{" "}
          <a
            href="mailto:fozziesdining@gmail.com"
            className="underline decoration-gold/70 underline-offset-4 transition hover:text-charcoal"
          >
            fozziesdining@gmail.com
          </a>
        </p>
        <p>
          Instagram:{" "}
          <a
            href="https://instagram.com/fozziesdining"
            className="underline decoration-gold/70 underline-offset-4 transition hover:text-charcoal"
          >
            @fozziesdining
          </a>
        </p>
      </div>
    </main>
  );
}
