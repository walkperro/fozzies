"use client";

import { useEffect } from "react";
import { MENU_META, MENU_SECTIONS } from "../menuData";

export default function MenuPrintPage() {
  useEffect(() => {
    // setTimeout(() => window.print(), 300); // optional auto-print
  }, []);

  return (
    <main className="mx-auto max-w-4xl bg-white px-6 py-10 text-black">
      <div className="mb-8 flex items-start justify-between gap-6">
        <div>
          <div className="text-3xl font-serif">{MENU_META.title}</div>
          <div className="mt-2 text-sm text-neutral-600">{MENU_META.subtitle}</div>
          <div className="mt-3 text-xs text-neutral-600">
            * gluten-free options available • {MENU_META.splitFee}
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-100"
        >
          Print / Save as PDF
        </button>
      </div>

      <div className="space-y-10">
        {MENU_SECTIONS.map((section) => (
          <section key={section.title}>
            <div className="mb-3 border-b border-neutral-200 pb-2">
              <div className="text-xl font-serif">{section.title}</div>
              {section.subtitle ? <div className="mt-1 text-sm text-neutral-600">{section.subtitle}</div> : null}
            </div>

            <div className="space-y-4">
              {section.items.map((item) => (
                <div key={item.name}>
                  <div className="text-base font-medium">
                    {item.gf ? "*" : ""}{item.name}
                  </div>
                  {item.desc?.length ? (
                    <div className="mt-1 text-sm text-neutral-700">
                      {item.desc.map((d) => (
                        <div key={d}>— {d}</div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className="border-t border-neutral-200 pt-6 text-sm text-neutral-700">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <div className="text-xs tracking-wider text-neutral-500">RESERVATIONS</div>
              <div className="mt-2">{MENU_META.reservations}</div>
            </div>

            <div>
              <div className="text-xs tracking-wider text-neutral-500">HOURS</div>
              <div className="mt-2 space-y-2">
                {MENU_META.hours.map((h) => (
                  <div key={h.label}>
                    <span className="text-neutral-500">{h.label} </span>
                    {h.value}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs tracking-wider text-neutral-500">FAQ</div>
              <div className="mt-2 space-y-2">
                {MENU_META.faq.map((f) => (
                  <div key={f.label}>
                    <span className="text-neutral-500">{f.label} — </span>
                    {f.value}
                  </div>
                ))}
              </div>

              <div className="mt-4 text-xs tracking-wider text-neutral-500">SOCIAL</div>
              <div className="mt-2 space-y-1">
                {MENU_META.social.map((s) => (
                  <div key={s.label}>
                    <span className="text-neutral-500">{s.label} — </span>
                    {s.value}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        @media print {
          header, nav { display: none !important; }
          html, body { background: white !important; }
          button { display: none !important; }
        }
      `}</style>
    </main>
  );
}
