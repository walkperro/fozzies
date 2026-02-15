"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type UploadState = "idle" | "uploading" | "uploaded" | "error";

export default function MenuPdfUploadForm() {
  const router = useRouter();
  const [state, setState] = useState<UploadState>("idle");
  const [status, setStatus] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("uploading");
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
      const updatedLabel = json.updatedAt ? new Date(json.updatedAt).toLocaleString() : new Date().toLocaleString();
      const fileLabel = json.fileName ? ` (${json.fileName})` : "";
      setState("uploaded");
      setStatus(`Uploaded.${fileLabel} ${updatedLabel}`);
      form.reset();
      router.refresh();
    } catch (err) {
      setState("error");
      setStatus(err instanceof Error ? err.message : "Upload failed");
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
        disabled={state === "uploading"}
        className="w-fit rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-charcoal transition hover:opacity-90 disabled:opacity-70"
      >
        {state === "uploading" ? "Uploading..." : "Upload PDF"}
      </button>
      {status ? <p className={`text-sm ${state === "error" ? "text-red-700" : "text-softgray"}`}>{status}</p> : null}
    </form>
  );
}
