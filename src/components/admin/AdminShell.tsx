"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/reservations", label: "Reservations" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/banner", label: "Banner" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/applicants", label: "Applicants" },
  { href: "/admin/menu", label: "Menu Editor" },
  { href: "/admin/menu-pdf", label: "Menu PDF" },
  { href: "/admin/activity", label: "Activity" },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const onLogin = pathname === "/admin/login";

  if (onLogin) return <>{children}</>;

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST", headers: { accept: "application/json" } });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="border border-charcoal/10 bg-cream shadow-sm">
        <header className="border-b border-charcoal/10 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[11px] tracking-[0.18em] text-softgray">FOZZIE&apos;S ADMIN</div>
              <h1 className="mt-1 font-serif text-2xl text-charcoal">Dashboard</h1>
            </div>
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={loggingOut}
              className="rounded-full border border-gold px-4 py-2 text-sm font-medium text-charcoal transition hover:bg-gold/15 disabled:opacity-70"
            >
              {loggingOut ? "Logging out..." : "Log out"}
            </button>
          </div>

          <nav className="mt-4 flex flex-wrap gap-2">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    "rounded-full border px-3 py-1.5 text-xs transition",
                    active
                      ? "border-gold bg-gold/20 font-medium text-charcoal"
                      : "border-charcoal/15 bg-ivory text-softgray hover:bg-ivory/70",
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <div className="px-4 py-6 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
