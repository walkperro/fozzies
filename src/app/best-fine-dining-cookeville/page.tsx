import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best Fine Dining in Cookeville, TN",
  description:
    "Discover chef-driven fine dining in Cookeville at Fozzie's Dining with seasonal menus, polished service, and an atmosphere made for meaningful evenings.",
  alternates: {
    canonical: "/best-fine-dining-cookeville",
  },
};

export default function BestFineDiningCookevillePage() {
  return (
    <main className="mx-auto max-w-6xl bg-ivory px-4 py-12 sm:px-6 sm:py-16">
      <section className="mx-auto max-w-4xl text-center">
        <h1 className="font-serif text-4xl text-charcoal sm:text-5xl">Best Fine Dining in Cookeville, TN</h1>
        <p className="mx-auto mt-4 max-w-3xl text-softgray leading-7">
          Fozzie&apos;s Dining brings together refined Southern hospitality, confident technique, and an atmosphere
          designed for evenings that deserve more than ordinary.
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
        <h2 className="font-serif text-2xl text-charcoal sm:text-3xl">Chef-Led Cuisine With Seasonal Intention</h2>
        <p className="mt-4 text-softgray leading-7">
          Every menu is built around fresh ingredients and thoughtful balance. From first course to dessert, each dish
          is crafted to feel elegant, generous, and distinctly memorable.
        </p>
        <p className="mt-4 text-softgray leading-7">
          Explore the current offerings on our <a href="/menu" className="underline decoration-gold/70 underline-offset-4 hover:text-charcoal">menu</a>.
        </p>
      </section>

      <section className="mx-auto mt-8 max-w-4xl border border-charcoal/10 bg-cream p-6 shadow-sm sm:p-8">
        <h2 className="font-serif text-2xl text-charcoal sm:text-3xl">An Elevated Atmosphere for Real Connection</h2>
        <p className="mt-4 text-softgray leading-7">
          Warm lighting, unhurried pacing, and attentive service set the tone for date nights, celebrations, and
          important dinners where every detail matters.
        </p>
      </section>

      <section className="mx-auto mt-8 max-w-4xl border border-charcoal/10 bg-cream p-6 shadow-sm sm:p-8">
        <h2 className="font-serif text-2xl text-charcoal sm:text-3xl">Plan Your Evening at Fozzie&apos;s</h2>
        <p className="mt-4 text-softgray leading-7">
          For private requests, special accommodations, or personalized dining questions, connect through our{" "}
          <a href="/contact" className="underline decoration-gold/70 underline-offset-4 hover:text-charcoal">contact page</a>.
        </p>
        <p className="mt-4 text-softgray leading-7">
          Ready now? Reserve directly at <a href="/#reserve" className="underline decoration-gold/70 underline-offset-4 hover:text-charcoal">#reserve</a>.
        </p>
      </section>
    </main>
  );
}
