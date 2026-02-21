"use client";

import { useMemo, useState, useTransition } from "react";
import { getDefaultContactPayload, isAllowedContactHref, type ContactBlock, type ContactPayload } from "@/lib/contactSettings";

const DEFAULTS = getDefaultContactPayload();

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeBlock(block: ContactBlock): ContactBlock {
  return {
    id: block.id || makeId("contact-block"),
    label: block.label || "",
    value: block.value || "",
    href: block.href || "",
  };
}

function toSnapshot(payload: ContactPayload) {
  return JSON.stringify(payload);
}

export default function ContactEditor({
  initialValue,
  saveAction,
}: {
  initialValue: ContactPayload;
  saveAction: (payload: ContactPayload) => Promise<{ ok: boolean; error?: string }>;
}) {
  const initialState = useMemo<ContactPayload>(
    () => ({
      title: initialValue.title || DEFAULTS.title,
      subtitle: initialValue.subtitle || "",
      blocks: initialValue.blocks.map(normalizeBlock),
      note: initialValue.note || "",
    }),
    [initialValue]
  );

  const [title, setTitle] = useState(initialState.title);
  const [subtitle, setSubtitle] = useState(initialState.subtitle || "");
  const [note, setNote] = useState(initialState.note || "");
  const [blocks, setBlocks] = useState<ContactBlock[]>(initialState.blocks);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState("");

  const currentPayload = useMemo<ContactPayload>(() => ({ title, subtitle, blocks, note }), [title, subtitle, blocks, note]);
  const [savedSnapshot, setSavedSnapshot] = useState(() => toSnapshot(currentPayload));
  const isDirty = toSnapshot(currentPayload) !== savedSnapshot;

  function addBlock() {
    setBlocks((prev) => [...prev, { id: makeId("contact-block"), label: "Label", value: "Value", href: "" }]);
  }

  function deleteBlock(blockIndex: number) {
    setBlocks((prev) => prev.filter((_, idx) => idx !== blockIndex));
  }

  function moveBlock(blockIndex: number, direction: -1 | 1) {
    setBlocks((prev) => {
      const nextIndex = blockIndex + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(blockIndex, 1);
      next.splice(nextIndex, 0, moved);
      return next;
    });
  }

  function save() {
    setStatus("");
    startTransition(async () => {
      const payload: ContactPayload = {
        title: title || DEFAULTS.title,
        subtitle: subtitle || "",
        note: note || "",
        blocks: blocks
          .map(normalizeBlock)
          .filter((block) => block.label.trim() && block.value.trim())
          .map((block) => ({
            ...block,
            href: isAllowedContactHref(block.href) ? block.href : "",
          })),
      };
      const fallbackPayload = payload.blocks.length > 0 ? payload : DEFAULTS;
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
          <h3 className="font-serif text-2xl text-charcoal">Contact Page</h3>
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
          <div>
            <label className="block text-[11px] tracking-[0.18em] text-softgray">NOTE (OPTIONAL)</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-serif text-2xl text-charcoal">Contact Blocks</h3>
          <button
            type="button"
            onClick={addBlock}
            className="rounded-full border border-gold px-4 py-1.5 text-sm font-medium text-charcoal transition hover:bg-gold/15"
          >
            Add Block
          </button>
        </div>

        {blocks.map((block, blockIndex) => (
          <div key={block.id} className="border border-charcoal/10 bg-cream p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs tracking-[0.14em] text-softgray">BLOCK {blockIndex + 1}</div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => moveBlock(blockIndex, -1)}
                  disabled={blockIndex === 0}
                  className="rounded-full border border-charcoal/20 px-3 py-1 text-xs text-charcoal disabled:opacity-50"
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => moveBlock(blockIndex, 1)}
                  disabled={blockIndex === blocks.length - 1}
                  className="rounded-full border border-charcoal/20 px-3 py-1 text-xs text-charcoal disabled:opacity-50"
                >
                  Down
                </button>
                <button
                  type="button"
                  onClick={() => deleteBlock(blockIndex)}
                  className="rounded-full border border-charcoal/20 px-3 py-1 text-xs text-charcoal hover:bg-charcoal/5"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] tracking-[0.18em] text-softgray">LABEL</label>
                <input
                  value={block.label}
                  onChange={(e) =>
                    setBlocks((prev) => prev.map((b, idx) => (idx !== blockIndex ? b : { ...b, label: e.target.value })))
                  }
                  className="mt-2 w-full border border-charcoal/15 bg-ivory px-3 py-2 text-charcoal outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] tracking-[0.18em] text-softgray">VALUE</label>
                <input
                  value={block.value}
                  onChange={(e) =>
                    setBlocks((prev) => prev.map((b, idx) => (idx !== blockIndex ? b : { ...b, value: e.target.value })))
                  }
                  className="mt-2 w-full border border-charcoal/15 bg-ivory px-3 py-2 text-charcoal outline-none"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-[11px] tracking-[0.18em] text-softgray">LINK URL (OPTIONAL)</label>
              <input
                value={block.href || ""}
                onChange={(e) =>
                  setBlocks((prev) => prev.map((b, idx) => (idx !== blockIndex ? b : { ...b, href: e.target.value })))
                }
                className="mt-2 w-full border border-charcoal/15 bg-ivory px-3 py-2 text-charcoal outline-none"
                placeholder="mailto:..., tel:..., https://..., /contact"
              />
            </div>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button
          disabled={isPending}
          onClick={save}
          className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-charcoal transition hover:opacity-90 disabled:opacity-70"
        >
          {isPending ? "Saving..." : "Save Contact"}
        </button>
        {status ? <div className="text-sm text-softgray">{status}</div> : null}
      </div>
    </div>
  );
}

