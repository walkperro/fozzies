"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

type NavItem = { href: string; label: string };

export default function MobileDrawer({
  open,
  onClose,
  items,
}: {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
}) {
  const pathname = usePathname();
  const navItems = [...items];
  if (!navItems.some((it) => it.href === "/join-the-team")) {
    navItems.push({ href: "/join-the-team", label: "Join The Team" });
  }
  if (!navItems.some((it) => it.href === "/privacy")) {
    navItems.push({ href: "/privacy", label: "Privacy" });
  }

  // ESC to close
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={[
          "fixed inset-0 z-40 transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      >
        <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" />
      </div>

      {/* Drawer */}
      <aside
        className={[
          "fixed right-0 top-0 z-50 h-full w-[82vw] max-w-[360px]",
          "bg-cream shadow-2xl ring-1 ring-charcoal/10",
          "transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <div className="text-sm tracking-[0.22em] text-softgray">MENU</div>
          <button
            onClick={onClose}
            className="rounded-full border border-gold/60 px-3 py-1 text-sm text-charcoal hover:bg-gold/10"
            aria-label="Close menu"
          >
            Close
          </button>
        </div>

        <div className="h-px w-full bg-charcoal/10" />

        <nav className="px-5 py-5">
          <ul className="space-y-4">
            {navItems.map((it) => {
              const active = pathname === it.href;
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    onClick={onClose}
                    className={[
                      "block text-lg transition",
                      active
                        ? "italic text-[#C8A24A]"
                        : "text-charcoal hover:text-[#C8A24A]",
                    ].join(" ")}
                  >
                    {it.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-8">
            <Link
              href="/reserve"
              onClick={onClose}
              className="inline-flex w-full items-center justify-center rounded-full border border-gold px-4 py-2 text-sm font-medium text-charcoal hover:bg-gold/15"
            >
              Reserve
            </Link>
          </div>
        </nav>
      </aside>
    </>
  );
}
