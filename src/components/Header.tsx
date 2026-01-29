"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Private Dining", href: "/events" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-charcoal/10 bg-ivory/85 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-3 items-center px-4 py-4 sm:px-6">
          {/* Left: Reserve */}
          <div className="justify-self-start">
            <a
              href="#reserve"
              className="inline-flex items-center justify-center rounded-full border border-gold px-4 py-2 text-sm font-medium text-charcoal no-underline transition hover:bg-gold/15"
            >
              Reserve
            </a>
          </div>

          {/* Center: Logo/Home */}
          <div className="justify-self-center">
            <Link href="/" className="inline-flex items-center no-underline">
              <Image
                src="/brand/title.png"
                alt="Fozzie's"
                width={220}
                height={60}
                priority
                className="h-8 w-auto sm:h-9"
              />
            </Link>
          </div>

          {/* Right: Menu button */}
          <div className="justify-self-end">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/10 bg-white/40 text-charcoal transition hover:border-charcoal/20"
              aria-label="Open menu"
            >
              <span className="sr-only">Open menu</span>
              <div className="flex flex-col gap-1.5">
                <span className="h-px w-5 bg-charcoal/70" />
                <span className="h-px w-5 bg-charcoal/70" />
                <span className="h-px w-5 bg-charcoal/70" />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Overlay menu */}
      {open && (
        <div className="fixed inset-0 z-[60]">
          {/* Backdrop */}
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ivory/92"
          />

          {/* Optional faint “editorial” blur layer */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.10] blur-2xl">
            <div className="absolute -left-16 top-24 h-72 w-72 rounded-full bg-gold/60" />
            <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-charcoal/20" />
            <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-gold/30" />
          </div>

          {/* Content */}
          <div className="relative mx-auto flex h-full max-w-6xl flex-col px-4 py-6 sm:px-6">
            <div className="flex items-center justify-between">
              <Link href="/" onClick={() => setOpen(false)} className="no-underline">
                <Image
                  src="/brand/title.png"
                  alt="Fozzie's"
                  width={220}
                  height={60}
                  className="h-8 w-auto sm:h-9"
                />
              </Link>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/10 bg-white/40 text-charcoal transition hover:border-charcoal/20"
                aria-label="Close menu"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>

            <div className="mt-10 flex-1">
              <nav className="space-y-4">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block font-serif text-4xl tracking-tight text-charcoal no-underline transition hover:opacity-70 sm:text-5xl"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-10 text-sm text-softgray">
                <div className="tracking-[0.18em]">HOURS</div>
                <div className="mt-2">
                  Dinner Tue–Sat • 5–9 PM <br />
                  Happy Hour Tue–Sat • 4–6 PM
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between text-xs text-softgray">
              <span className="tracking-[0.18em]">AN ELEVATED DINING EXPERIENCE</span>
              <a
                href="#reserve"
                onClick={() => setOpen(false)}
                className="rounded-full border border-gold px-4 py-2 font-medium text-charcoal no-underline transition hover:bg-gold/15"
              >
                Reserve
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
