"use client";

import Image from "next/image";
import Link from "next/link";
import { Allura } from "next/font/google";
import type { MenuItem, MenuMeta, MenuSection } from "@/app/menu/menuData";
import { trackEvent } from "@/lib/analytics";
import { GOLD_UNDERLINE_LINK_CLASS } from "@/lib/linkStyles";
import { track } from "@/lib/trackClient";
import { deriveFooterBlockFromMeta, getDefaultMenuPayload, type MenuFooterBlock } from "@/lib/menuSettings";

const allura = Allura({ subsets: ["latin"], weight: "400" });

type MenuRenderProps = {
  menuMeta?: Partial<MenuMeta> | null;
  menuSections?: MenuSection[] | null;
  footerBlock?: MenuFooterBlock | null;
  pdfUrl?: string;
  previewMode?: boolean;
};

function normalizeMeta(meta?: Partial<MenuMeta> | null): MenuMeta {
  const defaults = getDefaultMenuPayload().meta;
  if (!meta) return defaults;

  return {
    title: typeof meta.title === "string" && meta.title.trim() ? meta.title : defaults.title,
    subtitle: typeof meta.subtitle === "string" ? meta.subtitle : defaults.subtitle,
    glutenFreeNote:
      typeof meta.glutenFreeNote === "string" && meta.glutenFreeNote.trim()
        ? meta.glutenFreeNote
        : defaults.glutenFreeNote,
    splitFee: typeof meta.splitFee === "string" && meta.splitFee.trim() ? meta.splitFee : defaults.splitFee,
    reservations:
      typeof meta.reservations === "string" && meta.reservations.trim() ? meta.reservations : defaults.reservations,
    hours: Array.isArray(meta.hours) && meta.hours.length > 0 ? meta.hours : defaults.hours,
    faq: Array.isArray(meta.faq) && meta.faq.length > 0 ? meta.faq : defaults.faq,
    social: Array.isArray(meta.social) && meta.social.length > 0 ? meta.social : defaults.social,
  };
}

function normalizeSections(sections?: MenuSection[] | null): MenuSection[] {
  const defaults = getDefaultMenuPayload().sections;
  if (!Array.isArray(sections)) return defaults;
  if (sections.length === 0) return [];

  const normalized = sections
    .map((section) => {
      if (!section || typeof section !== "object" || typeof section.title !== "string" || !section.title.trim()) {
        return null;
      }
      const items = Array.isArray(section.items)
        ? section.items
            .map((item) => {
              if (!item || typeof item.name !== "string" || !item.name.trim()) return null;
              return {
                ...item,
                name: item.name,
                price: typeof item.price === "string" ? item.price : undefined,
                glutenFree: typeof item.glutenFree === "boolean" ? item.glutenFree : item.gf,
                gf: typeof item.glutenFree === "boolean" ? item.glutenFree : item.gf,
                desc: Array.isArray(item.desc) ? item.desc.filter((line) => typeof line === "string" && !!line.trim()) : [],
              } as MenuItem;
            })
            .filter((item): item is MenuItem => !!item)
        : [];

      return {
        title: section.title,
        subtitle: typeof section.subtitle === "string" && section.subtitle.trim() ? section.subtitle : undefined,
        items,
      } as MenuSection;
    })
    .filter((section): section is MenuSection => !!section);

  return normalized;
}

function isValidHttpHref(value?: string) {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

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
        {items.map((it, index) => {
          const isGlutenFree = it.glutenFree ?? it.gf;
          return (
            <div key={it.id || `${it.name}-${index}`} className="text-center">
              <div className="inline-flex items-baseline gap-2">
                <h3 className="font-serif text-xl text-charcoal">{it.name}</h3>
                {it.price ? <span className="text-sm text-softgray">{it.price}</span> : null}
                {isGlutenFree ? <span className="text-gold text-sm">*</span> : null}
              </div>

              {it.desc?.length ? (
                <div className="mt-2 text-[15px] leading-6 text-softgray">
                  <div className="mx-auto max-w-2xl">{it.desc.join(", ")}</div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function MenuRender({ menuMeta, menuSections, footerBlock, pdfUrl, previewMode = false }: MenuRenderProps) {
  const resolvedMeta = normalizeMeta(menuMeta);
  const resolvedSections = normalizeSections(menuSections);
  const resolvedPdfUrl = typeof pdfUrl === "string" && pdfUrl.trim() ? pdfUrl : "/fozzies-menu.pdf";
  const resolvedFooterBlock = footerBlock ?? deriveFooterBlockFromMeta(resolvedMeta);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <header className="text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto relative mt-6 h-[100px] w-full max-w-[160px] overflow-visible">
            <Image
              src="/brand/f_logo_hq.png"
              alt={resolvedMeta.title}
              fill
              priority
              className="object-contain object-center -translate-y-14"
            />
          </div>

          <div className="-mt-14 text-xs leading-tight tracking-[0.22em] text-softgray">{resolvedMeta.subtitle}</div>

          <div className="mx-auto mt-6 h-px w-64 bg-gold/60" />

          <div className="mt-6 space-y-1 text-sm text-softgray">
            <div>
              <span className="text-gold">*</span> {resolvedMeta.glutenFreeNote}
            </div>
            <div>{resolvedMeta.splitFee}</div>
          </div>

          {!previewMode ? (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href={resolvedPdfUrl}
                onClick={() =>
                  {
                    trackEvent("menu_pdf_open", {
                      location: "menu_page",
                      page_path: "/menu",
                    });
                    track("menu_pdf_open", {
                      page_path: "/menu",
                      meta: { location: "menu_page", pdf_url: resolvedPdfUrl },
                    });
                  }
                }
                className="inline-flex items-center justify-center rounded-full border border-gold px-5 py-2 text-sm font-medium text-charcoal no-underline transition hover:bg-gold/15"
                target="_blank"
                rel="noreferrer"
              >
                Print / Save as PDF
              </a>
              <a
                href="https://instagram.com/fozziesdining"
                className={`text-sm text-softgray transition ${GOLD_UNDERLINE_LINK_CLASS}`}
              >
                Follow @fozziesdining
              </a>
            </div>
          ) : null}
        </div>
      </header>

      {resolvedSections.map((section, index) => (
        <Section key={section.id || `${section.title}-${index}`} title={section.title} subtitle={section.subtitle} items={section.items} />
      ))}

      <footer className="mt-16 border-t border-charcoal/10 pt-10">
        <div className="grid gap-10 text-center md:grid-cols-3 md:text-left">
          <div className="text-softgray">
            <div className="text-xs tracking-[0.18em]">HOURS</div>
            <div className="mt-3 text-[15px] leading-6">
              {resolvedFooterBlock.hours.map((h, index) => (
                <div key={`${h.label}-${index}`} className="mt-2">
                  <div className="text-charcoal/80">{h.label}</div>
                  {h.value}
                </div>
              ))}
            </div>
          </div>

          <div className="text-softgray">
            <div className="text-xs tracking-[0.18em]">RESERVATIONS</div>
            <div className="mt-3 text-[15px] leading-6">
              {resolvedFooterBlock.reservationsText}
              {resolvedFooterBlock.reservationsDetails.map((f, index) => (
                <div key={`${f.label}-${index}`} className="mt-3">
                  <div className="text-charcoal/80">{f.label}</div>
                  {f.value}
                </div>
              ))}
            </div>
          </div>

          <div className="text-softgray">
            <div className="text-xs tracking-[0.18em]">CONNECT</div>
            <div className="mt-3 text-[15px] leading-6">
              {resolvedFooterBlock.connectLinks.length > 0
                ? resolvedFooterBlock.connectLinks.map((link, index) => (
                    <div key={`${link.label}-${index}`}>
                      {isValidHttpHref(link.href) ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-charcoal/70 ${GOLD_UNDERLINE_LINK_CLASS}`}
                        >
                          {link.label}
                        </a>
                      ) : (
                        <span className="text-charcoal/70">{link.label}</span>
                      )}
                    </div>
                  ))
                : null}

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
