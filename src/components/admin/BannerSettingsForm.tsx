"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteBannerSettings } from "@/lib/banner";

type SaveState = "idle" | "saving" | "saved" | "error";

export default function BannerSettingsForm({ initialValue }: { initialValue: SiteBannerSettings }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialValue.enabled);
  const [text, setText] = useState(initialValue.text);
  const [mode, setMode] = useState<SiteBannerSettings["mode"]>(initialValue.mode);
  const [speedInput, setSpeedInput] = useState(String(initialValue.speed ?? 40));
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");

  function normalizeSpeedInput(raw: string) {
    const parsed = Number(raw);
    const safe = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 20), 120) : 40;
    return safe;
  }

  useEffect(() => {
    if (state !== "saved") return;
    const id = setTimeout(() => {
      setState("idle");
      setMessage("");
    }, 2000);
    return () => clearTimeout(id);
  }, [state]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("saving");
    setMessage("");
    const speed = normalizeSpeedInput(speedInput);
    setSpeedInput(String(speed));

    try {
      const res = await fetch("/api/admin/banner", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          enabled,
          text,
          mode,
          speed,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Save failed");

      setState("saved");
      setMessage("Saved.");
      router.refresh();
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Failed to save banner.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 grid gap-4">
      <label className="inline-flex items-center gap-2 text-sm text-charcoal">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="accent-gold"
        />
        Enable banner
      </label>

      <div>
        <label className="block text-[11px] tracking-[0.18em] text-softgray">TEXT</label>
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Now accepting reservations for private dining experiences."
          className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-[11px] tracking-[0.18em] text-softgray">MODE</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value === "marquee" ? "marquee" : "static")}
            className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
          >
            <option value="static">Static</option>
            <option value="marquee">Marquee</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] tracking-[0.18em] text-softgray">MARQUEE SPEED (SECONDS)</label>
          <input
            type="number"
            min={20}
            max={120}
            inputMode="numeric"
            value={speedInput}
            onChange={(e) => {
              const next = e.target.value;
              if (next === "" || /^[0-9]+$/.test(next)) setSpeedInput(next);
            }}
            onBlur={() => setSpeedInput(String(normalizeSpeedInput(speedInput)))}
            className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
          />
        </div>
      </div>

      <button
        disabled={state === "saving"}
        className="w-fit rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-charcoal transition hover:opacity-90 disabled:opacity-70"
      >
        {state === "saving" ? "Saving..." : "Save Banner"}
      </button>

      {message ? (
        <p className={`text-sm ${state === "error" ? "text-red-700" : "text-softgray"}`} aria-live="polite">
          {message}
        </p>
      ) : null}
    </form>
  );
}
