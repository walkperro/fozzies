"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [token, setToken] = useState("");
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
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="mt-2 w-full border border-charcoal/15 bg-ivory px-3 py-2 text-charcoal outline-none"
              placeholder="••••••••••••••••"
            />
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
