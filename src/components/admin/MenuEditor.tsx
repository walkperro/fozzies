"use client";

import { useMemo, useState, useTransition } from "react";
import MenuRender from "@/components/menu/MenuRender";
import type { MenuItem, MenuSection } from "@/app/menu/menuData";
import { getDefaultMenuPayload, type MenuFooterBlock, type MenuPayload } from "@/lib/menuSettings";

type PreviewViewport = "mobile" | "desktop";

const DEFAULTS = getDefaultMenuPayload();
function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

const EMPTY_ITEM: MenuItem = { id: makeId("item"), name: "New Item", desc: [], price: "", glutenFree: false, gf: false };
const EMPTY_SECTION: MenuSection = {
  id: makeId("section"),
  title: "New Section",
  subtitle: "",
  items: [{ ...EMPTY_ITEM, id: makeId("item") }],
};

function normalizeItem(item: MenuItem): MenuItem {
  const isGlutenFree = item.glutenFree ?? item.gf ?? false;
  return {
    ...item,
    id: item.id || makeId("item"),
    price: typeof item.price === "string" ? item.price : "",
    glutenFree: isGlutenFree,
    gf: isGlutenFree,
    desc: Array.isArray(item.desc) ? item.desc : [],
  };
}

function normalizeSection(section: MenuSection): MenuSection {
  return {
    ...section,
    id: section.id || makeId("section"),
    subtitle: section.subtitle || "",
    items: (section.items || []).map(normalizeItem),
  };
}

function cloneFooterBlock(footerBlock: MenuFooterBlock): MenuFooterBlock {
  return {
    hours: footerBlock.hours.map((entry) => ({ ...entry })),
    reservationsText: footerBlock.reservationsText,
    reservationsDetails: footerBlock.reservationsDetails.map((entry) => ({ ...entry })),
    connectLinks: footerBlock.connectLinks.map((entry) => ({ ...entry })),
  };
}

function normalizeFooterHrefInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^www\./i.test(trimmed)) return `https://${trimmed}`;
  if (/^@/.test(trimmed)) return `https://instagram.com/${trimmed.replace(/^@+/, "")}`;
  if (trimmed.includes(".") && !/^[a-z][a-z\d+\-.]*:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

function toSnapshot(payload: MenuPayload) {
  return JSON.stringify(payload);
}

export default function MenuEditor({
  initialValue,
  currentPdfPath,
  saveAction,
}: {
  initialValue: MenuPayload;
  currentPdfPath: string;
  saveAction: (payload: MenuPayload) => Promise<{ ok: boolean; error?: string }>;
}) {
  const initialState = useMemo<MenuPayload>(
    () => ({
      meta: {
        ...DEFAULTS.meta,
        ...initialValue.meta,
      },
      sections: initialValue.sections.map(normalizeSection),
      footerBlock: cloneFooterBlock(initialValue.footerBlock || DEFAULTS.footerBlock!),
    }),
    [initialValue]
  );

  const [meta, setMeta] = useState<MenuPayload["meta"]>({
    ...initialState.meta,
  });
  const [sections, setSections] = useState<MenuSection[]>(initialState.sections);
  const [footerBlock, setFooterBlock] = useState<MenuFooterBlock>(cloneFooterBlock(initialState.footerBlock!));
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string>("");
  const [previewViewport, setPreviewViewport] = useState<PreviewViewport>("desktop");

  const currentPayload = useMemo<MenuPayload>(() => ({ meta, sections, footerBlock }), [meta, sections, footerBlock]);
  const [savedSnapshot, setSavedSnapshot] = useState(() => toSnapshot(currentPayload));
  const isDirty = toSnapshot(currentPayload) !== savedSnapshot;

  function updateItem(sectionIndex: number, itemIndex: number, patch: Partial<MenuItem>) {
    setSections((prev) =>
      prev.map((section, sIdx) =>
        sIdx !== sectionIndex
          ? section
          : {
              ...section,
              items: section.items.map((item, iIdx) =>
                iIdx !== itemIndex ? item : normalizeItem({ ...item, ...patch })
              ),
            }
      )
    );
  }

  function moveSection(index: number, direction: -1 | 1) {
    setSections((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const clone = [...prev];
      const [moved] = clone.splice(index, 1);
      clone.splice(nextIndex, 0, moved);
      return clone;
    });
  }

  function addSection() {
    setSections((prev) => [
      ...prev,
      { ...EMPTY_SECTION, id: makeId("section"), items: [{ ...EMPTY_ITEM, id: makeId("item") }] },
    ]);
  }

  function deleteSection(index: number) {
    setSections((prev) => prev.filter((_, idx) => idx !== index));
  }

  function addItem(sectionIndex: number) {
    setSections((prev) =>
      prev.map((section, idx) =>
        idx !== sectionIndex
          ? section
          : {
              ...section,
              items: [...section.items, { ...EMPTY_ITEM, id: makeId("item") }],
            }
      )
    );
  }

  function deleteItem(sectionIndex: number, itemIndex: number) {
    setSections((prev) =>
      prev.map((section, idx) =>
        idx !== sectionIndex
          ? section
          : {
              ...section,
              items: section.items.filter((_, iIdx) => iIdx !== itemIndex),
            }
      )
    );
  }

  function moveItem(sectionIndex: number, itemIndex: number, direction: -1 | 1) {
    setSections((prev) =>
      prev.map((section, idx) => {
        if (idx !== sectionIndex) return section;
        const nextIndex = itemIndex + direction;
        if (nextIndex < 0 || nextIndex >= section.items.length) return section;

        const nextItems = [...section.items];
        const [moved] = nextItems.splice(itemIndex, 1);
        nextItems.splice(nextIndex, 0, moved);
        return { ...section, items: nextItems };
      })
    );
  }

  function save() {
    setStatus("");
    startTransition(async () => {
      const payload: MenuPayload = {
        meta: {
          ...DEFAULTS.meta,
          ...meta,
          title: meta.title || DEFAULTS.meta.title,
          subtitle: meta.subtitle || DEFAULTS.meta.subtitle,
          glutenFreeNote: meta.glutenFreeNote || DEFAULTS.meta.glutenFreeNote,
          splitFee: meta.splitFee || DEFAULTS.meta.splitFee,
          reservations: meta.reservations || DEFAULTS.meta.reservations,
          hours: Array.isArray(meta.hours) && meta.hours.length > 0 ? meta.hours : DEFAULTS.meta.hours,
          faq: Array.isArray(meta.faq) && meta.faq.length > 0 ? meta.faq : DEFAULTS.meta.faq,
          social: Array.isArray(meta.social) && meta.social.length > 0 ? meta.social : DEFAULTS.meta.social,
        },
        sections: sections.map(normalizeSection),
        footerBlock: {
          hours:
            Array.isArray(footerBlock.hours) && footerBlock.hours.length > 0 ? footerBlock.hours : DEFAULTS.footerBlock!.hours,
          reservationsText: footerBlock.reservationsText || DEFAULTS.footerBlock!.reservationsText,
          reservationsDetails:
            Array.isArray(footerBlock.reservationsDetails) && footerBlock.reservationsDetails.length > 0
              ? footerBlock.reservationsDetails
              : DEFAULTS.footerBlock!.reservationsDetails,
          connectLinks:
            Array.isArray(footerBlock.connectLinks) && footerBlock.connectLinks.length > 0
              ? footerBlock.connectLinks
              : DEFAULTS.footerBlock!.connectLinks,
        },
      };

      const res = await saveAction(payload);
      if (res.ok) {
        setSavedSnapshot(toSnapshot(payload));
        setStatus("Saved.");
      } else {
        setStatus(res.error || "Failed to save.");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,45%)_minmax(0,55%)] lg:items-start">
      <div className="space-y-6">
        <section className="border border-charcoal/10 bg-ivory p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-serif text-2xl text-charcoal">Menu Meta</h3>
            <div className="text-xs text-softgray">{isDirty ? "Unsaved changes" : "All changes saved"}</div>
          </div>
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-serif text-2xl text-charcoal">Sections</h3>
            <button
              type="button"
              onClick={addSection}
              className="rounded-full border border-gold px-4 py-1.5 text-sm font-medium text-charcoal transition hover:bg-gold/15"
            >
              Add Section
            </button>
          </div>

          {sections.map((section, sectionIndex) => (
            <div key={section.id || `section-${sectionIndex}`} className="border border-charcoal/10 bg-cream p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs tracking-[0.14em] text-softgray">SECTION {sectionIndex + 1}</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => moveSection(sectionIndex, -1)}
                    disabled={sectionIndex === 0}
                    className="rounded-full border border-charcoal/20 px-3 py-1 text-xs text-charcoal disabled:opacity-50"
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(sectionIndex, 1)}
                    disabled={sectionIndex === sections.length - 1}
                    className="rounded-full border border-charcoal/20 px-3 py-1 text-xs text-charcoal disabled:opacity-50"
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSection(sectionIndex)}
                    className="rounded-full border border-charcoal/20 px-3 py-1 text-xs text-charcoal hover:bg-charcoal/5"
                  >
                    Delete
                  </button>
                </div>
              </div>

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
                          idx !== sectionIndex ? s : { ...s, subtitle: e.target.value.trim() ? e.target.value : "" }
                        )
                      )
                    }
                    className="mt-2 w-full border border-charcoal/15 bg-ivory px-3 py-2 text-charcoal outline-none"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {section.items.map((item, itemIndex) => (
                  <div key={item.id || `item-${itemIndex}`} className="border border-charcoal/10 bg-ivory p-3">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs tracking-[0.14em] text-softgray">ITEM {itemIndex + 1}</div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => moveItem(sectionIndex, itemIndex, -1)}
                          disabled={itemIndex === 0}
                          className="rounded-full border border-charcoal/20 px-3 py-1 text-xs text-charcoal disabled:opacity-50"
                        >
                          Up
                        </button>
                        <button
                          type="button"
                          onClick={() => moveItem(sectionIndex, itemIndex, 1)}
                          disabled={itemIndex === section.items.length - 1}
                          className="rounded-full border border-charcoal/20 px-3 py-1 text-xs text-charcoal disabled:opacity-50"
                        >
                          Down
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteItem(sectionIndex, itemIndex)}
                          className="rounded-full border border-charcoal/20 px-3 py-1 text-xs text-charcoal hover:bg-charcoal/5"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

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
                        <label className="block text-[11px] tracking-[0.18em] text-softgray">PRICE (OPTIONAL)</label>
                        <input
                          value={item.price || ""}
                          onChange={(e) => updateItem(sectionIndex, itemIndex, { price: e.target.value })}
                          className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
                          placeholder="$18"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-[11px] tracking-[0.18em] text-softgray">DESCRIPTION LINES (1 PER LINE)</label>
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

                    <label className="mt-3 inline-flex items-center gap-2 text-sm text-charcoal">
                      <input
                        type="checkbox"
                        checked={!!(item.glutenFree ?? item.gf)}
                        onChange={(e) =>
                          updateItem(sectionIndex, itemIndex, { glutenFree: e.target.checked, gf: e.target.checked })
                        }
                        className="accent-gold"
                      />
                      Gluten-free marker
                    </label>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => addItem(sectionIndex)}
                className="mt-4 rounded-full border border-gold px-4 py-1.5 text-sm font-medium text-charcoal transition hover:bg-gold/15"
              >
                Add Item
              </button>
            </div>
          ))}
        </section>

        <section className="border border-charcoal/10 bg-ivory p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-serif text-2xl text-charcoal">Footer Block</h3>
          </div>

          <div className="mt-4 space-y-6">
            <div>
              <div className="text-[11px] tracking-[0.18em] text-softgray">HOURS</div>
              <div className="mt-3 space-y-3">
                {footerBlock.hours.map((row, index) => (
                  <div key={`footer-hours-${index}`} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                    <input
                      value={row.label}
                      onChange={(e) =>
                        setFooterBlock((prev) => ({
                          ...prev,
                          hours: prev.hours.map((entry, i) => (i === index ? { ...entry, label: e.target.value } : entry)),
                        }))
                      }
                      className="w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
                      placeholder="Label"
                    />
                    <input
                      value={row.value}
                      onChange={(e) =>
                        setFooterBlock((prev) => ({
                          ...prev,
                          hours: prev.hours.map((entry, i) => (i === index ? { ...entry, value: e.target.value } : entry)),
                        }))
                      }
                      className="w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
                      placeholder="Value"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFooterBlock((prev) => ({
                          ...prev,
                          hours: prev.hours.filter((_, i) => i !== index),
                        }))
                      }
                      className="rounded-full border border-charcoal/20 px-3 py-1 text-xs text-charcoal hover:bg-charcoal/5"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setFooterBlock((prev) => ({
                    ...prev,
                    hours: [...prev.hours, { label: "", value: "" }],
                  }))
                }
                className="mt-3 rounded-full border border-gold px-4 py-1.5 text-sm font-medium text-charcoal transition hover:bg-gold/15"
              >
                Add Hour Row
              </button>
            </div>

            <div>
              <div className="text-[11px] tracking-[0.18em] text-softgray">RESERVATIONS</div>
              <div className="mt-3">
                <label className="block text-[11px] tracking-[0.18em] text-softgray">RESERVATIONS TEXT</label>
                <input
                  value={footerBlock.reservationsText}
                  onChange={(e) => setFooterBlock((prev) => ({ ...prev, reservationsText: e.target.value }))}
                  className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
                />
              </div>
              <div className="mt-3 space-y-3">
                {footerBlock.reservationsDetails.map((row, index) => (
                  <div key={`footer-res-details-${index}`} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                    <input
                      value={row.label}
                      onChange={(e) =>
                        setFooterBlock((prev) => ({
                          ...prev,
                          reservationsDetails: prev.reservationsDetails.map((entry, i) =>
                            i === index ? { ...entry, label: e.target.value } : entry
                          ),
                        }))
                      }
                      className="w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
                      placeholder="Label"
                    />
                    <input
                      value={row.value}
                      onChange={(e) =>
                        setFooterBlock((prev) => ({
                          ...prev,
                          reservationsDetails: prev.reservationsDetails.map((entry, i) =>
                            i === index ? { ...entry, value: e.target.value } : entry
                          ),
                        }))
                      }
                      className="w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
                      placeholder="Value"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFooterBlock((prev) => ({
                          ...prev,
                          reservationsDetails: prev.reservationsDetails.filter((_, i) => i !== index),
                        }))
                      }
                      className="rounded-full border border-charcoal/20 px-3 py-1 text-xs text-charcoal hover:bg-charcoal/5"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setFooterBlock((prev) => ({
                    ...prev,
                    reservationsDetails: [...prev.reservationsDetails, { label: "", value: "" }],
                  }))
                }
                className="mt-3 rounded-full border border-gold px-4 py-1.5 text-sm font-medium text-charcoal transition hover:bg-gold/15"
              >
                Add Detail Row
              </button>
            </div>

            <div>
              <div className="text-[11px] tracking-[0.18em] text-softgray">CONNECT</div>
              <div className="mt-3 space-y-3">
                {footerBlock.connectLinks.map((row, index) => (
                  <div key={`footer-connect-${index}`} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                    <input
                      value={row.label}
                      onChange={(e) =>
                        setFooterBlock((prev) => ({
                          ...prev,
                          connectLinks: prev.connectLinks.map((entry, i) =>
                            i === index ? { ...entry, label: e.target.value } : entry
                          ),
                        }))
                      }
                      className="w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
                      placeholder="Display Text"
                    />
                    <input
                      value={row.href || ""}
                      onChange={(e) =>
                        setFooterBlock((prev) => ({
                          ...prev,
                          connectLinks: prev.connectLinks.map((entry, i) =>
                            i === index ? { ...entry, href: normalizeFooterHrefInput(e.target.value) } : entry
                          ),
                        }))
                      }
                      className="w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
                      placeholder="URL"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFooterBlock((prev) => ({
                          ...prev,
                          connectLinks: prev.connectLinks.filter((_, i) => i !== index),
                        }))
                      }
                      className="rounded-full border border-charcoal/20 px-3 py-1 text-xs text-charcoal hover:bg-charcoal/5"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setFooterBlock((prev) => ({
                    ...prev,
                    connectLinks: [...prev.connectLinks, { label: "", href: "" }],
                  }))
                }
                className="mt-3 rounded-full border border-gold px-4 py-1.5 text-sm font-medium text-charcoal transition hover:bg-gold/15"
              >
                Add Connect Row
              </button>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-4">
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

      <section className="border border-charcoal/10 bg-ivory p-4 lg:max-h-[calc(100vh-7.5rem)] lg:overflow-y-auto">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] tracking-[0.18em] text-softgray">PREVIEW</div>
            <div className="text-sm text-softgray">Live view of the public menu</div>
          </div>

          <div className="inline-flex rounded-full border border-charcoal/15 bg-cream p-1 text-xs">
            <button
              type="button"
              onClick={() => setPreviewViewport("mobile")}
              className={`rounded-full px-3 py-1 ${previewViewport === "mobile" ? "bg-gold/25 text-charcoal" : "text-softgray"}`}
            >
              Mobile
            </button>
            <button
              type="button"
              onClick={() => setPreviewViewport("desktop")}
              className={`rounded-full px-3 py-1 ${previewViewport === "desktop" ? "bg-gold/25 text-charcoal" : "text-softgray"}`}
            >
              Desktop
            </button>
          </div>
        </div>

        <div className={`border border-charcoal/10 bg-cream ${previewViewport === "mobile" ? "mx-auto max-w-[430px]" : "w-full"}`}>
          <MenuRender menuMeta={meta} menuSections={sections} footerBlock={footerBlock} pdfUrl={currentPdfPath} previewMode />
        </div>
      </section>
    </div>
  );
}
