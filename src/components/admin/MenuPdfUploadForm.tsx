"use client";

import { useState } from "react";

export default function MenuPdfUploadForm() {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setStatus("");

    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      const res = await fetch("/api/admin/menu-pdf-upload", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Upload failed");
      setStatus(`Uploaded. Current path: ${json.path}`);
      form.reset();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 grid gap-4">
      <div>
        <label className="block text-[11px] tracking-[0.18em] text-softgray">PDF FILE</label>
        <input
          type="file"
          name="file"
          accept="application/pdf"
          required
          className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none file:mr-3 file:border-0 file:bg-gold/20 file:px-3 file:py-1 file:text-charcoal"
        />
      </div>
      <button
        disabled={busy}
        className="w-fit rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-charcoal transition hover:opacity-90 disabled:opacity-70"
      >
        {busy ? "Uploading..." : "Upload PDF"}
      </button>
      {status ? <p className="text-sm text-softgray">{status}</p> : null}
    </form>
  );
}
