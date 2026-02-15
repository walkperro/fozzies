"use client";

import { useActionState } from "react";

type BlastState = {
  ok: boolean;
  recipients: number;
  error?: string;
};

const INITIAL_STATE: BlastState = { ok: false, recipients: 0 };

export default function ClientsBlastForm({
  action,
}: {
  action: (state: BlastState, formData: FormData) => Promise<BlastState>;
}) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);

  return (
    <div>
      {state.ok ? (
        <p className="mt-2 text-sm text-softgray">Blast queued for {state.recipients} recipients (stub).</p>
      ) : null}
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
        <button
          disabled={pending}
          className="w-fit rounded-full border border-gold px-5 py-2.5 text-sm font-semibold text-charcoal transition hover:bg-gold/15 disabled:opacity-70"
        >
          {pending ? "Counting..." : "Send Blast (TODO)"}
        </button>
      </form>
    </div>
  );
}
