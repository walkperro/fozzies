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
  const [closing, setClosing] = useState(false);

  const closeMenu = () => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 220);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const Wordmark = ({ className = "" }: { className?: string }) => (
    <Image
      src="/brand/title_solo_hq.png"
      alt="Fozzie's"
      width={720}
      height={200}
      priority
      className={className}
    />
  );

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-charcoal/10 bg-ivory/85 backdrop-blur overflow-x-clip">
        {/* Fixed header height so logo size won't stretch the navbar */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative flex h-16 items-center justify-between sm:h-[68px]">
            {/* Left: Reserve */}
            <div className="flex items-center">
              <a
                href="/#reserve"
                className="inline-flex items-center justify-center rounded-full border border-gold px-4 py-2 text-sm font-medium text-charcoal no-underline transition hover:bg-gold/15"
              >
                Reserve
              </a>
            </div>

            {/* Center: Home logo (absolute so it doesn't affect height) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Link href="/" className="inline-flex items-center no-underline">
                <Wordmark
                  className="h-14 w-auto sm:h-16 scale-[2.2] sm:scale-[2.6] translate-y-3 origin-center"
                />
              </Link>
            </div>

            {/* Right: Hamburger (no circle) */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center justify-center px-3 py-3 text-charcoal/90 transition hover:text-charcoal"
                aria-label="Open menu"
              >
                <div className="flex flex-col gap-2">
                  <span className="h-px w-6 bg-charcoal/70" />
                  <span className="h-px w-6 bg-charcoal/70" />
                  <span className="h-px w-6 bg-charcoal/70" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {open && (
        <div
          className={`fixed inset-0 z-[100] ${
            closing ? "fz-overlay-out" : "fz-overlay-in"
          }`}
        >
          <div className="absolute inset-0 bg-ivory" onClick={closeMenu} />
          <div className="pointer-events-none absolute inset-0 opacity-[0.08] blur-3xl">
            <div className="absolute -left-24 top-24 h-80 w-80 rounded-full bg-gold/60" />
            <div className="absolute right-0 top-0 h-[28rem] w-[28rem] rounded-full bg-charcoal/20" />
            <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-gold/30" />
          </div>

          <div className="relative z-[110] mx-auto flex h-full max-w-6xl flex-col px-4 py-4 sm:px-6">
            <div className="relative flex h-16 items-center justify-between sm:h-[68px]">
              <div className="flex items-center">
                <a
                  href="/#reserve"
                  onClick={closeMenu}
                  className="inline-flex items-center justify-center rounded-full border border-gold px-4 py-2 text-sm font-medium text-charcoal no-underline transition hover:bg-gold/15"
                >
                  Reserve
                </a>
              </div>

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <Link href="/" onClick={closeMenu} className="inline-flex no-underline">
                  <Wordmark className="h-14 w-auto sm:h-16 scale-[2.2] sm:scale-[2.6] translate-y-3 origin-center" />
                </Link>
              </div>

              <div className="flex items-center">
                <button
                  type="button"
                  onClick={closeMenu}
                  className="inline-flex items-center justify-center px-3 py-3 text-charcoal/90 transition hover:text-charcoal"
                  aria-label="Close menu"
                >
                  <span className="text-3xl leading-none">×</span>
                </button>
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-center pb-10">
              <nav className="space-y-5">
                {NAV.map((item, i) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className="block font-serif text-5xl leading-[0.96] tracking-tight text-charcoal no-underline transition hover:opacity-70 sm:text-6xl fz-navitem"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div
                className="mt-10 text-sm text-softgray fz-navitem"
                style={{ animationDelay: `${NAV.length * 60 + 40}ms` }}
              >
                <div className="tracking-[0.18em]">HOURS</div>
                <div className="mt-2">
                  Dinner Tue–Sat • 5–9 PM <br />
                  Happy Hour Tue–Sat • 4–6 PM
                </div>
              </div>
            </div>

            <div
              className="flex items-center justify-between text-xs text-softgray fz-navitem"
              style={{ animationDelay: `${NAV.length * 60 + 120}ms` }}
            >
              <span className="tracking-[0.18em]">AN ELEVATED DINING EXPERIENCE</span>
              <a
                href="/#reserve"
                onClick={closeMenu}
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
