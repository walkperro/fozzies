import Image from "next/image";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <section className="grid gap-10 md:grid-cols-12 md:items-start">
        {/* Left: Brand / Copy */}
        <div className="md:col-span-7">
          <div className="inline-flex items-center gap-3 text-xs tracking-[0.22em] text-softgray">
            <span className="h-px w-10 bg-gold/50" />
            — CHEF-OWNED • COOKEVILLE, TN —
          </div>

          {/* Brand lockup (replaces text H1) */}
          <div className="mt-6">
            <Image
              src="/brand/title_tagline_no_bg.png"
              alt="Fozzie's — An Elevated Dining Experience"
              width={780}
              height={220}
              priority
              className="mx-auto h-auto w-[96%] max-w-[640px] sm:max-w-[760px]"
            />
          </div>

          <p className="mt-6 max-w-xl text-lg text-charcoal/80">
            Crafted for memorable evenings, celebrations, and the moments worth dressing up for.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
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

          <div className="mt-10 grid gap-4 rounded-2xl border border-charcoal/10 bg-white/40 p-5 sm:grid-cols-2">
            <div>
              <div className="text-xs tracking-[0.18em] text-softgray">DINNER</div>
              <div className="mt-1 text-sm text-charcoal">
                Tue–Sat <span className="text-charcoal/60">•</span> 5–9 PM
              </div>
            </div>
            <div>
              <div className="text-xs tracking-[0.18em] text-softgray">HAPPY HOUR</div>
              <div className="mt-1 text-sm text-charcoal">
                Tue–Sat <span className="text-charcoal/60">•</span> 4–6 PM
              </div>
            </div>
          </div>
        </div>

        {/* Right: Gallery placeholders */}
        <div className="md:col-span-5">
          <div className="grid gap-4">
            <div className="rounded-3xl border border-charcoal/10 bg-white/50 p-4">
              <div className="text-xs tracking-[0.18em] text-softgray">FEATURED</div>
              <div className="mt-2 h-44 rounded-2xl border border-charcoal/10 bg-ivory" />
              <div className="mt-3 text-sm text-charcoal/70">
                Food photography + chef features will live here.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="h-32 rounded-2xl border border-charcoal/10 bg-white/50" />
              <div className="h-32 rounded-2xl border border-charcoal/10 bg-white/50" />
            </div>
          </div>
        </div>
      </section>

      {/* Reserve */}
      <section id="reserve" className="mt-16 scroll-mt-28">
        <div className="rounded-3xl border border-charcoal/10 bg-white/45 p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-3xl text-charcoal">Reservations</h2>
              <p className="mt-2 max-w-2xl text-sm text-softgray">
                Reservations are strongly recommended. Book via OpenTable.
              </p>
            </div>

            <a
              href="#"
              className="rounded-full border border-gold px-5 py-2.5 text-sm font-medium text-charcoal no-underline transition hover:bg-gold/15"
            >
              Open OpenTable
            </a>
          </div>

          <div className="mt-6 rounded-2xl border border-charcoal/10 bg-ivory p-6 text-sm text-charcoal/70">
            OpenTable widget will be embedded here once you send the reservation link / widget code.
          </div>
        </div>
      </section>
    </main>
  );
}
