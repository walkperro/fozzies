"use client";

import { useActionState } from "react";

type BlastState = {
  ok: boolean;
  recipients: number;
  failedCount: number;
  failures: Array<{ email: string; errorMessage: string }>;
  mode?: "blast" | "test";
  hint?: string;
  message?: string;
  error?: string;
};

const INITIAL_STATE: BlastState = { ok: false, recipients: 0, failedCount: 0, failures: [] };

export default function ClientsBlastForm({
  action,
  blastEnabled,
}: {
  action: (state: BlastState, formData: FormData) => Promise<BlastState>;
  blastEnabled: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);

  return (
    <div>
      {!blastEnabled ? <p className="mt-2 text-sm text-softgray">Set RESEND_API_KEY and RESEND_FROM to enable blasts.</p> : null}
      {state.ok ? (
        <div className="mt-2 rounded-sm border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-charcoal">
          {state.message || `Sent to ${state.recipients} recipients.`}
          {state.failedCount > 0 ? ` Failed for ${state.failedCount}: ${state.failures[0]?.errorMessage || "Unknown error"}` : ""}
        </div>
      ) : null}
      {state.hint ? <p className="mt-2 text-sm text-softgray">{state.hint}</p> : null}
      {state.error ? <p className="mt-2 text-sm text-red-700">{state.error}</p> : null}
      <form action={formAction} className="mt-4 grid gap-4">
        <div>
          <label className="block text-[11px] tracking-[0.18em] text-softgray">SUBJECT</label>
          <input
            name="subject"
            required
            className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] tracking-[0.18em] text-softgray">BODY</label>
          <textarea
            name="body"
            rows={6}
            required
            className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] tracking-[0.18em] text-softgray">TEST EMAIL</label>
          <input
            type="email"
            name="testEmail"
            placeholder="you@example.com"
            className="mt-2 w-full border border-charcoal/15 bg-cream px-3 py-2 text-charcoal outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            name="sendMode"
            value="blast"
            disabled={pending || !blastEnabled}
            className="w-fit rounded-full border border-gold px-5 py-2.5 text-sm font-semibold text-charcoal transition hover:bg-gold/15 disabled:opacity-70"
          >
            {pending ? "Sending..." : "Send Blast"}
          </button>
          <button
            type="submit"
            name="sendMode"
            value="test"
            disabled={pending || !blastEnabled}
            className="w-fit rounded-full border border-charcoal/20 px-5 py-2.5 text-sm font-semibold text-charcoal transition hover:bg-charcoal/5 disabled:opacity-70"
          >
            {pending ? "Sending..." : "Send Test"}
          </button>
        </div>
      </form>
    </div>
  );
}
