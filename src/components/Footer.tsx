"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const EXPLORE_LINKS = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
  { label: "Join The Team", href: "/join-the-team" },
];

const COOKEVILLE_LINKS = [
  { label: "Fine Dining in Cookeville", href: "/best-fine-dining-cookeville" },
  { label: "Romantic Dinner in Cookeville", href: "/romantic-dinner-cookeville" },
  { label: "Private Dining in Cookeville", href: "/private-dining-cookeville" },
];

const FOOTER_LINK_CLASS =
  "text-softgray no-underline transition hover:text-charcoal hover:underline hover:decoration-gold/70 hover:underline-offset-4";

export default function Footer() {
  const pathname = usePathname();

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return null;
  }

  return (
    <footer className="border-t border-charcoal/10 bg-cream text-sm text-softgray">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="font-serif text-2xl text-charcoal">Fozzie&apos;s Dining</p>
          <p className="mt-2 text-[13px] tracking-[0.14em] text-softgray">MOMENTS TURNED TO MEMORIES</p>
          <p className="mt-4 leading-6">
            Chef-driven fine dining in Cookeville, Tennessee — seasonal menus, warm hospitality, and evenings worth
            dressing up for.
          </p>
          <a
            href="https://instagram.com/fozziesdining"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block text-charcoal underline decoration-gold/70 underline-offset-4 transition hover:opacity-80"
          >
            @fozziesdining
          </a>
        </div>

        <nav aria-label="Explore" className="md:col-span-2">
          <p className="text-[11px] tracking-[0.18em] text-charcoal/70">EXPLORE</p>
          <ul className="mt-3 space-y-2">
            {EXPLORE_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={FOOTER_LINK_CLASS}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Dining in Cookeville" className="md:col-span-3">
          <p className="text-[11px] tracking-[0.18em] text-charcoal/70">DINING IN COOKEVILLE</p>
          <ul className="mt-3 space-y-2">
            {COOKEVILLE_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={FOOTER_LINK_CLASS}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-3">
          <p className="text-[11px] tracking-[0.18em] text-charcoal/70">VISIT</p>
          <ul className="mt-3 space-y-2">
            <li>Cookeville, Tennessee</li>
            <li>
              <a href="tel:+19312617163" className={FOOTER_LINK_CLASS}>
                (931) 261-7163
              </a>
            </li>
            <li>
              <a href="mailto:fozziesdining@gmail.com" className={FOOTER_LINK_CLASS}>
                fozziesdining@gmail.com
              </a>
            </li>
            <li className="pt-2">
              Dinner: Tue–Sat, 5–9 PM
              <br />
              Happy Hour: Tue–Sat, 4–6 PM
            </li>
            <li className="pt-2">
              <a
                href="/#reserve"
                className="inline-flex items-center justify-center rounded-full border border-gold px-4 py-2 text-sm font-medium text-charcoal no-underline transition hover:bg-gold/15"
              >
                Reserve a Table
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-charcoal/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-5 sm:px-6 md:flex-row md:justify-between">
          <Link href="/privacy" className={FOOTER_LINK_CLASS}>
            Privacy Policy
          </Link>
          <p className="text-softgray/80">© Fozzie&apos;s Dining 2026</p>
          <a
            href="https://walkperro.com"
            target="_blank"
            rel="noreferrer"
            className="text-charcoal/70 no-underline transition hover:underline hover:underline-offset-4"
          >
            Powered by WalkPerro
          </a>
        </div>
      </div>
    </footer>
  );
}
