import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Read the Fozzie's Dining privacy policy for reservations, newsletter, applications, and analytics.",
  openGraph: {
    title: "Privacy | Fozzie's Dining",
    description: "Read the Fozzie's Dining privacy policy for reservations, newsletter, applications, and analytics.",
    url: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="text-[11px] tracking-[0.18em] text-softgray">POLICY</div>
      <h1 className="mt-2 font-serif text-4xl text-charcoal">Privacy</h1>
      <p className="mt-3 max-w-3xl text-softgray">
        We respect your privacy and use your information thoughtfully to operate Fozzie’s Dining.
      </p>

      <section className="mt-8 space-y-6 border border-charcoal/10 bg-cream p-6 sm:p-8">
        <div>
          <h2 className="font-serif text-2xl text-charcoal">What We Collect</h2>
          <p className="mt-2 text-sm leading-7 text-softgray">
            We may collect contact information you provide directly, including reservation details, newsletter signups,
            and job application submissions.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-2xl text-charcoal">How We Use It</h2>
          <p className="mt-2 text-sm leading-7 text-softgray">
            We use submitted data to respond to inquiries, manage operations, process reservations and applications, and
            send occasional updates when you opt in.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-2xl text-charcoal">Email Marketing</h2>
          <p className="mt-2 text-sm leading-7 text-softgray">
            Marketing emails include an unsubscribe link. We maintain suppression protections to avoid sending to
            unsubscribed addresses, hard bounces, and complaints.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-2xl text-charcoal">Cookies & Analytics</h2>
          <p className="mt-2 text-sm leading-7 text-softgray">
            We may use essential site cookies and analytics tools (including GA4 or similar) to improve performance and
            guest experience.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-2xl text-charcoal">Data Retention & Contact</h2>
          <p className="mt-2 text-sm leading-7 text-softgray">
            We retain data only as needed for operations and legal obligations. For privacy questions, contact us at{" "}
            <a className="underline decoration-gold/70 underline-offset-4" href="mailto:reservations@fozziesdining.com">
              fozziesdining@gmail.com
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
