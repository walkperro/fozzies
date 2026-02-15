import Link from "next/link";
import Image from "next/image";
import { Allura } from "next/font/google";
import { MENU_META, MENU_SECTIONS, type MenuItem, type MenuMeta, type MenuSection } from "./menuData";
import { getSettingValue } from "@/lib/settings";

const allura = Allura({ subsets: ["latin"], weight: "400" });
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
        <h2 className={`${allura.className} text-5xl text-charcoal`}>{title}</h2>
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

export default async function MenuPage() {
  let menuMeta: MenuMeta = MENU_META;
  let menuSections: MenuSection[] = MENU_SECTIONS;
  let menuPdfPath = "/fozzies-menu.pdf";

  const [storedMenu, storedPdf] = await Promise.all([
    getSettingValue<{ meta?: MenuMeta; sections?: MenuSection[] }>("menu_html"),
    getSettingValue<{ path?: string }>("menu_pdf"),
  ]);

  if (storedMenu?.meta && Array.isArray(storedMenu.sections)) {
    menuMeta = storedMenu.meta;
    menuSections = storedMenu.sections;
  }
  if (storedPdf?.path && typeof storedPdf.path === "string") {
    menuPdfPath = storedPdf.path;
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <header className="text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto relative h-[100px] w-full max-w-[160px] overflow-visible mt-6">
            <Image
              src="/brand/f_logo_hq.png"
              alt={menuMeta.title}
              fill
              priority
              className="object-contain object-center -translate-y-14"
            />
          </div>

          <div className="-mt-14 text-xs leading-tight tracking-[0.22em] text-softgray">{menuMeta.subtitle}</div>

          <div className="mx-auto mt-6 h-px w-64 bg-gold/60" />

          {/* Notes: 2 clean lines */}
          <div className="mt-6 space-y-1 text-sm text-softgray">
            <div>
              <span className="text-gold">*</span> {menuMeta.glutenFreeNote}
            </div>
            <div>{menuMeta.splitFee}</div>
          </div>

          {/* Single button: goes to PDF file */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={menuPdfPath}
              className="inline-flex items-center justify-center rounded-full border border-gold px-5 py-2 text-sm font-medium text-charcoal no-underline transition hover:bg-gold/15"
              target="_blank"
              rel="noreferrer"
            >
              Print / Save as PDF
            </a>
          </div>
        </div>
      </header>

      {menuSections.map((section) => (
        <Section key={section.title} title={section.title} subtitle={section.subtitle} items={section.items} />
      ))}

      <footer className="mt-16 border-t border-charcoal/10 pt-10">
        <div className="grid gap-10 text-center md:grid-cols-3 md:text-left">
          <div className="text-softgray">
            <div className="text-xs tracking-[0.18em]">HOURS</div>
            <div className="mt-3 text-[15px] leading-6">
              {menuMeta.hours.map((h) => (
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
              {menuMeta.reservations}
              {menuMeta.faq.map((f) => (
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
