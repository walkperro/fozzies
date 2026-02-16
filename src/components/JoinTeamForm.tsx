"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { track } from "@/lib/trackClient";

const POSITIONS = [
  "Host",
  "Server",
  "Bartender",
  "Line Cook",
  "Prep Cook",
  "Dishwasher",
  "Manager",
  "Other",
] as const;

export default function JoinTeamForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");
  const [availability, setAvailability] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [company, setCompany] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"idle" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setStatus("idle");

    try {
      const res = await fetch("/api/jobs/apply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone,
          position,
          availability,
          message,
          website,
          company,
          consent,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        throw new Error(typeof json.error === "string" ? json.error : "Could not submit your application.");
      }
      trackEvent("job_application_submit", {
        page_path: "/join-the-team",
      });
      track("job_application_submit", {
        page_path: "/join-the-team",
        meta: { position },
      });
      router.push("/join-the-team/thank-you");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not submit your application.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 border border-charcoal/10 bg-cream p-6 shadow-sm sm:p-8">
      <h2 className="font-serif text-3xl text-charcoal">Application</h2>
      <p className="mt-2 text-sm text-softgray">Tell us a bit about yourself and the role you’re seeking.</p>

      {status === "error" ? <div className="mt-4 text-sm text-red-700">{error}</div> : null}

      <form onSubmit={onSubmit} className="mt-5 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[11px] tracking-[0.18em] text-softgray">FULL NAME *</label>
            <input
              required
              maxLength={120}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-2 w-full border border-charcoal/15 bg-ivory px-3 py-2 text-charcoal outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] tracking-[0.18em] text-softgray">EMAIL *</label>
            <input
              required
              type="email"
              maxLength={180}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full border border-charcoal/15 bg-ivory px-3 py-2 text-charcoal outline-none"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[11px] tracking-[0.18em] text-softgray">PHONE</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2 w-full border border-charcoal/15 bg-ivory px-3 py-2 text-charcoal outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] tracking-[0.18em] text-softgray">POSITION *</label>
            <select
              required
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="mt-2 w-full border border-charcoal/15 bg-ivory px-3 py-2 text-charcoal outline-none"
            >
              <option value="">Select a position</option>
              {POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] tracking-[0.18em] text-softgray">AVAILABILITY</label>
          <input
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="mt-2 w-full border border-charcoal/15 bg-ivory px-3 py-2 text-charcoal outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] tracking-[0.18em] text-softgray">MESSAGE / EXPERIENCE *</label>
          <textarea
            required
            rows={6}
            maxLength={4000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-2 w-full border border-charcoal/15 bg-ivory px-3 py-2 text-charcoal outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] tracking-[0.18em] text-softgray">WEBSITE</label>
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="mt-2 w-full border border-charcoal/15 bg-ivory px-3 py-2 text-charcoal outline-none"
          />
        </div>

        <div className="hidden" aria-hidden="true">
          <label>Company</label>
          <input tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>

        <label className="flex items-start gap-2 text-sm text-softgray">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-4 w-4 accent-gold"
            required
          />
          <span>
            I agree to the <Link href="/privacy" className="underline decoration-gold/70 underline-offset-4">Privacy Policy</Link>.
          </span>
        </label>

        <button
          type="submit"
          disabled={busy}
          className="w-fit rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-charcoal transition hover:opacity-90 disabled:opacity-70"
        >
          {busy ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </section>
  );
}
