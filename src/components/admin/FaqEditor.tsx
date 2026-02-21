"use client";

import { useMemo, useState, useTransition } from "react";
import { getDefaultFaqPayload, type FaqItem, type FaqPayload, type FaqSection } from "@/lib/faqSettings";

const DEFAULTS = getDefaultFaqPayload();

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeItem(item: FaqItem): FaqItem {
  return {
    id: item.id || makeId("faq-item"),
    question: item.question || "",
    answer: item.answer || "",
  };
}

function normalizeSection(section: FaqSection): FaqSection {
  return {
    id: section.id || makeId("faq-section"),
    heading: section.heading || "",
    items: (section.items || []).map(normalizeItem),
  };
}

function toSnapshot(payload: FaqPayload) {
  return JSON.stringify(payload);
}

export default function FaqEditor({
  initialValue,
  saveAction,
}: {
  initialValue: FaqPayload;
  saveAction: (payload: FaqPayload) => Promise<{ ok: boolean; error?: string }>;
}) {
  const initialState = useMemo<FaqPayload>(
    () => ({
      title: initialValue.title || DEFAULTS.title,
      subtitle: initialValue.subtitle || "",
      sections: initialValue.sections.map(normalizeSection),
    }),
    [initialValue]
  );

  const [title, setTitle] = useState(initialState.title);
  const [subtitle, setSubtitle] = useState(initialState.subtitle || "");
  const [sections, setSections] = useState<FaqSection[]>(initialState.sections);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState("");

  const currentPayload = useMemo<FaqPayload>(() => ({ title, subtitle, sections }), [title, subtitle, sections]);
  const [savedSnapshot, setSavedSnapshot] = useState(() => toSnapshot(currentPayload));
  const isDirty = toSnapshot(currentPayload) !== savedSnapshot;

  function addSection() {
    setSections((prev) => [...prev, { id: makeId("faq-section"), heading: "New Section", items: [] }]);
  }

  function deleteSection(sectionIndex: number) {
    setSections((prev) => prev.filter((_, idx) => idx !== sectionIndex));
  }

  function moveSection(sectionIndex: number, direction: -1 | 1) {
    setSections((prev) => {
      const nextIndex = sectionIndex + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(sectionIndex, 1);
      next.splice(nextIndex, 0, moved);
      return next;
    });
  }

  function addItem(sectionIndex: number) {
    setSections((prev) =>
      prev.map((section, idx) =>
        idx !== sectionIndex
          ? section
          : {
              ...section,
              items: [...section.items, { id: makeId("faq-item"), question: "New question", answer: "" }],
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
      const payload: FaqPayload = {
        title: title || DEFAULTS.title,
        subtitle: subtitle || "",
        sections: sections
          .map(normalizeSection)
          .filter((section) => section.heading.trim().length > 0)
          .map((section) => ({
            ...section,
            items: section.items.filter((item) => item.question.trim() && item.answer.trim()),
          }))
          .filter((section) => section.items.length > 0),
      };
      const fallbackPayload = payload.sections.length > 0 ? payload : DEFAULTS;
      const res = await saveAction(fallbackPayload);
      if (res.ok) {
        setSavedSnapshot(toSnapshot(fallbackPayload));
        setStatus("Saved.");
      } else {
        setStatus(res.error || "Failed to save.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className="border border-charcoal/10 bg-ivory p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-serif text-2xl text-charcoal">FAQ Page</h3>
          <div className="text-xs text-softgray">{isDirty ? "Unsaved changes" : "All changes saved"}</div>
        </div>
        <div className="mt-4 grid gap-4">
          <div>
            <label className="block text-[11px] tracking-[0.18em] text-softgray">TITLE</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] tracking-[0.18em] text-softgray">SUBTITLE (OPTIONAL)</label>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
            />
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
          <div key={section.id} className="border border-charcoal/10 bg-cream p-4">
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

            <div>
              <label className="block text-[11px] tracking-[0.18em] text-softgray">SECTION HEADING</label>
              <input
                value={section.heading}
                onChange={(e) =>
                  setSections((prev) => prev.map((s, idx) => (idx !== sectionIndex ? s : { ...s, heading: e.target.value })))
                }
                className="mt-2 w-full border border-charcoal/15 bg-ivory px-3 py-2 text-charcoal outline-none"
              />
            </div>

            <div className="mt-4 space-y-3">
              {section.items.map((item, itemIndex) => (
                <div key={item.id} className="border border-charcoal/10 bg-ivory p-3">
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

                  <div>
                    <label className="block text-[11px] tracking-[0.18em] text-softgray">QUESTION</label>
                    <input
                      value={item.question}
                      onChange={(e) =>
                        setSections((prev) =>
                          prev.map((s, sIdx) =>
                            sIdx !== sectionIndex
                              ? s
                              : {
                                  ...s,
                                  items: s.items.map((it, iIdx) =>
                                    iIdx !== itemIndex ? it : { ...it, question: e.target.value }
                                  ),
                                }
                          )
                        )
                      }
                      className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
                    />
                  </div>

                  <div className="mt-3">
                    <label className="block text-[11px] tracking-[0.18em] text-softgray">ANSWER</label>
                    <textarea
                      rows={4}
                      value={item.answer}
                      onChange={(e) =>
                        setSections((prev) =>
                          prev.map((s, sIdx) =>
                            sIdx !== sectionIndex
                              ? s
                              : {
                                  ...s,
                                  items: s.items.map((it, iIdx) =>
                                    iIdx !== itemIndex ? it : { ...it, answer: e.target.value }
                                  ),
                                }
                          )
                        )
                      }
                      className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
                    />
                  </div>
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

      <div className="flex flex-wrap items-center gap-4">
        <button
          disabled={isPending}
          onClick={save}
          className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-charcoal transition hover:opacity-90 disabled:opacity-70"
        >
          {isPending ? "Saving..." : "Save FAQ"}
        </button>
        {status ? <div className="text-sm text-softgray">{status}</div> : null}
      </div>
    </div>
  );
}

