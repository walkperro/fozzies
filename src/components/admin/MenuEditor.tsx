"use client";

import { useState, useTransition } from "react";
import type { MenuMeta, MenuSection } from "@/app/menu/menuData";

type MenuPayload = {
  meta: MenuMeta;
  sections: MenuSection[];
};

export default function MenuEditor({
  initialValue,
  saveAction,
}: {
  initialValue: MenuPayload;
  saveAction: (payload: MenuPayload) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [meta, setMeta] = useState<MenuMeta>(initialValue.meta);
  const [sections, setSections] = useState<MenuSection[]>(initialValue.sections);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string>("");

  function updateItem(sectionIndex: number, itemIndex: number, patch: Partial<MenuSection["items"][number]>) {
    setSections((prev) =>
      prev.map((section, sIdx) =>
        sIdx !== sectionIndex
          ? section
          : {
              ...section,
              items: section.items.map((item, iIdx) => (iIdx !== itemIndex ? item : { ...item, ...patch })),
            }
      )
    );
  }

  function save() {
    setStatus("");
    startTransition(async () => {
      const res = await saveAction({ meta, sections });
      if (res.ok) {
        setStatus("Saved menu settings.");
      } else {
        setStatus(res.error || "Failed to save.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className="border border-charcoal/10 bg-ivory p-5">
        <h3 className="font-serif text-2xl text-charcoal">Menu Meta</h3>
        <div className="mt-4 grid gap-4">
          <div>
            <label className="block text-[11px] tracking-[0.18em] text-softgray">TITLE</label>
            <input
              value={meta.title}
              onChange={(e) => setMeta((prev) => ({ ...prev, title: e.target.value }))}
              className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] tracking-[0.18em] text-softgray">SUBTITLE</label>
            <input
              value={meta.subtitle}
              onChange={(e) => setMeta((prev) => ({ ...prev, subtitle: e.target.value }))}
              className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] tracking-[0.18em] text-softgray">GLUTEN-FREE NOTE</label>
              <input
                value={meta.glutenFreeNote}
                onChange={(e) => setMeta((prev) => ({ ...prev, glutenFreeNote: e.target.value }))}
                className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] tracking-[0.18em] text-softgray">SPLIT FEE NOTE</label>
              <input
                value={meta.splitFee}
                onChange={(e) => setMeta((prev) => ({ ...prev, splitFee: e.target.value }))}
                className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-serif text-2xl text-charcoal">Sections</h3>
        {sections.map((section, sectionIndex) => (
          <div key={`${section.title}-${sectionIndex}`} className="border border-charcoal/10 bg-cream p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] tracking-[0.18em] text-softgray">SECTION TITLE</label>
                <input
                  value={section.title}
                  onChange={(e) =>
                    setSections((prev) =>
                      prev.map((s, idx) => (idx !== sectionIndex ? s : { ...s, title: e.target.value }))
                    )
                  }
                  className="mt-2 w-full border border-charcoal/15 bg-ivory px-3 py-2 text-charcoal outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] tracking-[0.18em] text-softgray">SUBTITLE</label>
                <input
                  value={section.subtitle || ""}
                  onChange={(e) =>
                    setSections((prev) =>
                      prev.map((s, idx) =>
                        idx !== sectionIndex ? s : { ...s, subtitle: e.target.value.trim() ? e.target.value : undefined }
                      )
                    )
                  }
                  className="mt-2 w-full border border-charcoal/15 bg-ivory px-3 py-2 text-charcoal outline-none"
                />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {section.items.map((item, itemIndex) => (
                <div key={`${item.name}-${itemIndex}`} className="border border-charcoal/10 bg-ivory p-3">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-[11px] tracking-[0.18em] text-softgray">ITEM NAME</label>
                      <input
                        value={item.name}
                        onChange={(e) => updateItem(sectionIndex, itemIndex, { name: e.target.value })}
                        className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] tracking-[0.18em] text-softgray">DESCRIPTION (1 LINE EACH)</label>
                      <textarea
                        rows={3}
                        value={(item.desc || []).join("\n")}
                        onChange={(e) =>
                          updateItem(sectionIndex, itemIndex, {
                            desc: e.target.value
                              .split("\n")
                              .map((v) => v.trim())
                              .filter(Boolean),
                          })
                        }
                        className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
                      />
                    </div>
                  </div>
                  <label className="mt-3 inline-flex items-center gap-2 text-sm text-charcoal">
                    <input
                      type="checkbox"
                      checked={!!item.gf}
                      onChange={(e) => updateItem(sectionIndex, itemIndex, { gf: e.target.checked })}
                      className="accent-gold"
                    />
                    Gluten-free marker
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <div className="flex items-center gap-4">
        <button
          disabled={isPending}
          onClick={save}
          className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-charcoal transition hover:opacity-90 disabled:opacity-70"
        >
          {isPending ? "Saving..." : "Save Menu"}
        </button>
        {status ? <div className="text-sm text-softgray">{status}</div> : null}
      </div>
    </div>
  );
}
