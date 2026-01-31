import Link from "next/link";
import { MENU_META, MENU_SECTIONS, type MenuItem } from "./menuData";

function Section({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle?: string;
  items: MenuItem[];
}) {
  return (
    <section className="mt-12">
      <div className="text-center">
        <h2 className="font-serif text-3xl tracking-tight text-charcoal">{title}</h2>
        {subtitle ? <div className="mt-2 text-sm text-softgray">{subtitle}</div> : null}
        <div className="mx-auto mt-4 h-px w-40 bg-gold/60" />
      </div>

      <div className="mt-8 space-y-7">
        {items.map((it) => (
          <div key={it.name} className="text-center">
            <div className="inline-flex items-baseline gap-2">
              <h3 className="font-serif text-xl text-charcoal">{it.name}</h3>
              {it.gf ? <span className="text-gold text-sm">*</span> : null}
            </div>

            {it.desc?.length ? (
              <div className="mt-2 text-[15px] leading-6 text-softgray">
                <div className="mx-auto max-w-2xl">{it.desc.join(", ")}</div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function MenuPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6">
      <header className="text-center">
        <div className="mx-auto max-w-3xl">
          <div className="font-serif text-5xl text-charcoal">{MENU_META.title}</div>

          <div className="mt-2 text-xs tracking-[0.22em] text-softgray">{MENU_META.subtitle}</div>

          <div className="mx-auto mt-6 h-px w-64 bg-gold/60" />

          <div className="mt-6 text-sm text-softgray">
            <span className="text-gold">*</span> {MENU_META.glutenFreeNote}
            <span className="mx-2">•</span>
            {MENU_META.splitFee}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/menu/print"
              className="inline-flex items-center justify-center rounded-full border border-gold px-5 py-2 text-sm font-medium text-charcoal no-underline transition hover:bg-gold/15"
            >
              Print / Save as PDF
            </Link>

            <a
              href="/fozzies-menu.pdf"
              className="inline-flex items-center justify-center rounded-full bg-charcoal px-5 py-2 text-sm font-medium text-cream no-underline transition hover:opacity-90"
            >
              Download PDF
            </a>
          </div>
        </div>
      </header>

      {MENU_SECTIONS.map((section) => (
        <Section key={section.title} title={section.title} subtitle={section.subtitle} items={section.items} />
      ))}

      <footer className="mt-16 border-t border-charcoal/10 pt-10">
        <div className="grid gap-10 text-center md:grid-cols-3 md:text-left">
          <div className="text-softgray">
            <div className="text-xs tracking-[0.18em]">HOURS</div>
            <div className="mt-3 text-[15px] leading-6">
              {MENU_META.hours.map((h) => (
                <div key={h.label} className="mt-2">
                  <div className="text-charcoal/80">{h.label}</div>
                  {h.value}
                </div>
              ))}
            </div>
          </div>

          <div className="text-softgray">
            <div className="text-xs tracking-[0.18em]">RESERVATIONS</div>
            <div className="mt-3 text-[15px] leading-6">
              {MENU_META.reservations}
              {MENU_META.faq.map((f) => (
                <div key={f.label} className="mt-3">
                  <div className="text-charcoal/80">{f.label}</div>
                  {f.value}
                </div>
              ))}
            </div>
          </div>

          <div className="text-softgray">
            <div className="text-xs tracking-[0.18em]">CONNECT</div>
            <div className="mt-3 text-[15px] leading-6">
              Facebook — <span className="text-charcoal/70">Coming soon</span>
              <br />
              Instagram — <span className="text-charcoal/70">Coming soon</span>

              <div className="mt-5">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-full border border-gold px-4 py-2 text-sm font-medium text-charcoal no-underline transition hover:bg-gold/15"
                >
                  Back Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
