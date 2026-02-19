import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Romantic Dinner in Cookeville, TN",
  description:
    "Plan a romantic dinner in Cookeville at Fozzie's Dining, where chef-driven menus, warm ambiance, and attentive service create unforgettable evenings.",
  alternates: {
    canonical: "/romantic-dinner-cookeville",
  },
};

export default function RomanticDinnerCookevillePage() {
  return (
    <main className="mx-auto max-w-6xl bg-ivory px-4 py-12 sm:px-6 sm:py-16">
      <section className="mx-auto max-w-4xl text-center">
        <h1 className="font-serif text-4xl text-charcoal sm:text-5xl">Romantic Dinner in Cookeville, TN</h1>
        <p className="mx-auto mt-4 max-w-3xl text-softgray leading-7">
          For anniversaries, first dates, and quiet celebrations, Fozzie&apos;s Dining offers a setting where
          conversation lingers and every course feels intentional.
        </p>
        <div className="mt-8">
          <a
            href="/#reserve"
            className="inline-block rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-charcoal no-underline transition hover:opacity-90"
          >
            Reserve a Table
          </a>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-4xl border border-charcoal/10 bg-cream p-6 shadow-sm sm:p-8">
        <h2 className="font-serif text-2xl text-charcoal sm:text-3xl">Designed for Date Night</h2>
        <p className="mt-4 text-softgray leading-7">
          Soft light, elegant plating, and a polished pace create an intimate backdrop without feeling formal or
          rushed. It&apos;s upscale dining with genuine warmth.
        </p>
      </section>

      <section className="mx-auto mt-8 max-w-4xl border border-charcoal/10 bg-cream p-6 shadow-sm sm:p-8">
        <h2 className="font-serif text-2xl text-charcoal sm:text-3xl">Chef-Driven Menus, Thoughtful Pairings</h2>
        <p className="mt-4 text-softgray leading-7">
          Seasonal dishes and signature favorites are prepared to be shared, savored, and remembered. Preview tonight&apos;s
          options on our <a href="/menu" className="underline decoration-gold/70 underline-offset-4 hover:text-charcoal">menu</a>.
        </p>
      </section>

      <section className="mx-auto mt-8 max-w-4xl border border-charcoal/10 bg-cream p-6 shadow-sm sm:p-8">
        <h2 className="font-serif text-2xl text-charcoal sm:text-3xl">Reserve or Reach Out</h2>
        <p className="mt-4 text-softgray leading-7">
          For special requests before your evening, visit our{" "}
          <a href="/contact" className="underline decoration-gold/70 underline-offset-4 hover:text-charcoal">contact page</a>.
        </p>
        <p className="mt-4 text-softgray leading-7">
          Secure your table directly at <a href="/#reserve" className="underline decoration-gold/70 underline-offset-4 hover:text-charcoal">#reserve</a>.
        </p>
      </section>
    </main>
  );
}
