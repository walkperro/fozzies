"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteBannerSettings } from "@/lib/banner";

type SaveState = "idle" | "saving" | "saved" | "error";

export default function BannerSettingsForm({ initialValue }: { initialValue: SiteBannerSettings }) {
  const minSeconds = 20;
  const maxSeconds = 120;

  const router = useRouter();
  const [enabled, setEnabled] = useState(initialValue.enabled);
  const [text, setText] = useState(initialValue.text);
  const [mode, setMode] = useState<SiteBannerSettings["mode"]>(initialValue.mode);
  const [speed, setSpeed] = useState(
    Number.isFinite(initialValue.speed)
      ? Math.min(Math.max(initialValue.speed, minSeconds), maxSeconds)
      : 40
  );
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState("");

  function sliderToSeconds(value: number) {
    return Math.round(maxSeconds - (value / 100) * (maxSeconds - minSeconds));
  }

  function secondsToSlider(value: number) {
    return Math.round(((maxSeconds - value) / (maxSeconds - minSeconds)) * 100);
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
    const normalizedSpeed = Math.min(Math.max(speed, minSeconds), maxSeconds);
    setSpeed(normalizedSpeed);

    try {
      const res = await fetch("/api/admin/banner", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          enabled,
          text,
          mode,
          speed: normalizedSpeed,
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
          <label className="block text-[11px] tracking-[0.18em] text-softgray">MARQUEE SPEED</label>
          <div className={`mt-2 rounded-sm border border-charcoal/10 bg-cream px-3 py-3 ${mode === "static" ? "opacity-55" : ""}`}>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={secondsToSlider(speed)}
              onChange={(e) => setSpeed(sliderToSeconds(Number(e.target.value)))}
              disabled={mode === "static"}
              className="w-full accent-gold"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-softgray">
              <span>Slow</span>
              <span>Fast</span>
            </div>
            <div className="mt-2 text-sm text-softgray">Preview: message passes in ~{speed}s</div>
          </div>
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
