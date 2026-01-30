import Image from "next/image";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <section className="grid gap-10 md:grid-cols-12 md:items-start">
        <div className="md:col-span-7 text-center md:text-left">
          <div className="inline-flex items-center gap-3 text-xs tracking-[0.22em] text-softgray">
            <span className="h-px w-10 bg-gold/50" />
            CHEF-OWNED • COOKEVILLE, TN
            <span className="h-px w-10 bg-gold/50" />
          </div>

          <div className="mt-6 flex justify-center md:justify-start">
            <Image
              src="/brand/title_tagline_hq.png"
              alt="Fozzie's — An Elevated Dining Experience"
              width={820}
              height={240}
              priority
              className="h-auto w-[94%] max-w-[640px] sm:max-w-[760px]"
            />
          </div>

          <p className="mt-6 mx-auto max-w-xl text-lg text-charcoal/80 md:mx-0">
            Crafted for memorable evenings, celebrations, and the moments worth dressing up for.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
            <a
              href="#reserve"
              className="rounded-full border border-gold px-5 py-2.5 text-sm font-medium text-charcoal no-underline transition hover:bg-gold/15"
            >
              Reserve a Table
            </a>
            <a
              href="/menu"
              className="rounded-full border border-charcoal/15 px-5 py-2.5 text-sm font-medium text-charcoal/80 no-underline transition hover:border-charcoal/25 hover:text-charcoal"
            >
              View Menu
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
