"use client";

import { useState } from "react";

type BlastResponse = {
  ok: boolean;
  sentCount: number;
  failedCount: number;
  failures: Array<{ email: string; errorMessage: string }>;
  hint?: string;
  error?: string;
};

export default function ClientsBlastForm({ blastEnabled }: { blastEnabled: boolean }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<BlastResponse | null>(null);
  const [error, setError] = useState("");
  const [showFailures, setShowFailures] = useState(false);

  async function send(mode: "blast" | "test") {
    setPending(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/admin/blast/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          subject,
          body,
          testEmail: mode === "test",
          testTo: mode === "test" ? testEmail : undefined,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to send.");
      }

      setResult({
        ok: true,
        sentCount: json.sentCount || 0,
        failedCount: json.failedCount || 0,
        failures: Array.isArray(json.failures) ? json.failures : [],
        hint: json.hint,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      {!blastEnabled ? <p className="mt-2 text-sm text-softgray">Set RESEND_API_KEY and RESEND_FROM to enable blasts.</p> : null}

      {result?.ok ? (
        <div className="mt-2 rounded-sm border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-charcoal" aria-live="polite">
          Sent to {result.sentCount} recipients. Failed: {result.failedCount}.
          {result.failedCount > 0 ? (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setShowFailures((v) => !v)}
                className="text-xs underline decoration-gold/80 underline-offset-4"
              >
                {showFailures ? "Hide failure details" : "Show failure details"}
              </button>
              {showFailures ? (
                <ul className="mt-2 list-disc pl-5 text-xs text-softgray">
                  {result.failures.map((f, idx) => (
                    <li key={`${f.email}-${idx}`}>{f.email}: {f.errorMessage}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {result?.hint ? <p className="mt-2 text-sm text-softgray">{result.hint}</p> : null}
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}

      <div className="mt-4 grid gap-4">
        <div>
          <label className="block text-[11px] tracking-[0.18em] text-softgray">SUBJECT</label>
          <input
            name="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] tracking-[0.18em] text-softgray">BODY</label>
          <textarea
            name="body"
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] tracking-[0.18em] text-softgray">TEST EMAIL</label>
          <input
            type="email"
            name="testEmail"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void send("blast")}
            disabled={pending || !blastEnabled}
            className="w-fit rounded-full border border-gold px-5 py-2.5 text-sm font-semibold text-charcoal transition hover:bg-gold/15 disabled:opacity-70"
          >
            {pending ? "Sending..." : "Send Blast"}
          </button>
          <button
            type="button"
            onClick={() => void send("test")}
            disabled={pending || !blastEnabled}
            className="w-fit rounded-full border border-charcoal/20 px-5 py-2.5 text-sm font-semibold text-charcoal transition hover:bg-charcoal/5 disabled:opacity-70"
          >
            {pending ? "Sending..." : "Send Test"}
          </button>
        </div>
      </div>
    </div>
  );
}
