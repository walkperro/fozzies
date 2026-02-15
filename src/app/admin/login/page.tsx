"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error(j.error || "Login failed");
      window.location.href = "/admin";
    } catch (e: any) {
      setErr(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <div className="border border-charcoal/10 bg-cream shadow-sm p-6">
        <div className="text-[11px] tracking-[0.18em] text-softgray">FOZZIE’S</div>
        <h1 className="mt-2 font-serif text-3xl text-charcoal">Admin Login</h1>
        <p className="mt-2 text-sm text-softgray">Enter the admin token.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-[11px] tracking-[0.18em] text-softgray">ADMIN TOKEN</label>
            <div className="relative mt-2">
              <input
                type={showToken ? "text" : "password"}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full border border-charcoal/15 bg-ivory px-3 py-2 pr-11 text-charcoal outline-none"
                placeholder="••••••••••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowToken((v) => !v)}
                aria-label={showToken ? "Hide token" : "Show token"}
                className="absolute right-1.5 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center text-sm text-softgray opacity-70 transition hover:opacity-100"
              >
                {showToken ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                    <path
                      d="M3 3l18 18m-3.5-5.2A9.9 9.9 0 0 0 21 12s-3.5-7-9-7c-1.7 0-3.2.4-4.5 1.1m-2.9 2.4A13.3 13.3 0 0 0 3 12s3.5 7 9 7c2.2 0 4.1-.7 5.6-1.8M14.1 14.1A3 3 0 0 1 9.9 9.9"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                    <path
                      d="M1.5 12s3.8-7 10.5-7 10.5 7 10.5 7-3.8 7-10.5 7S1.5 12 1.5 12Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {err && <div className="text-sm text-red-600">{err}</div>}

          <button
            disabled={loading}
            className="w-full rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-charcoal transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
