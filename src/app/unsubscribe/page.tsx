"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type State = "idle" | "loading" | "success" | "already" | "invalid" | "error";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [state, setState] = useState<State>("idle");

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }

    let cancelled = false;
    async function run() {
      setState("loading");
      try {
        const res = await fetch("/api/unsubscribe", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const json = await res.json();
        if (cancelled) return;

        if (!res.ok || !json.ok) {
          if (res.status === 404 || json.error === "Invalid token") setState("invalid");
          else setState("error");
          return;
        }

        if (json.status === "already_unsubscribed") setState("already");
        else setState("success");
      } catch {
        if (!cancelled) setState("error");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
      <section className="border border-charcoal/10 bg-ivory p-8 text-center shadow-sm">
        <div className="text-[11px] tracking-[0.18em] text-softgray">FOZZIE'S</div>
        <h1 className="mt-3 font-serif text-4xl text-charcoal">Email Preferences</h1>

        {state === "loading" ? <p className="mt-4 text-sm text-softgray">Processing your request…</p> : null}
        {state === "success" ? (
          <p className="mt-4 text-sm text-softgray">You’re all set. You won’t receive further updates.</p>
        ) : null}
        {state === "already" ? (
          <p className="mt-4 text-sm text-softgray">You’ve already been unsubscribed.</p>
        ) : null}
        {state === "invalid" ? (
          <p className="mt-4 text-sm text-softgray">This link is invalid or expired.</p>
        ) : null}
        {state === "error" ? (
          <p className="mt-4 text-sm text-red-700">Could not update preferences right now. Please try again later.</p>
        ) : null}

        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-gold px-4 py-2 text-sm font-medium text-charcoal no-underline transition hover:bg-gold/15"
          >
            Back Home
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
          <section className="border border-charcoal/10 bg-ivory p-8 text-center shadow-sm">
            <div className="text-[11px] tracking-[0.18em] text-softgray">FOZZIE'S</div>
            <h1 className="mt-3 font-serif text-4xl text-charcoal">Email Preferences</h1>
            <p className="mt-4 text-sm text-softgray">Processing your request…</p>
          </section>
        </main>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
