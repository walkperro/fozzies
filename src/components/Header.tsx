import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-charcoal/10 bg-ivory/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="group flex items-baseline gap-3">
          <span className="font-serif text-2xl tracking-tight text-charcoal">
            Fozzie’s
          </span>
          <span className="hidden text-xs tracking-[0.18em] text-softgray sm:inline">
            ROOTED IN CRAFT. ELEVATED BY FLAVOR.
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-7 text-sm text-charcoal/80 md:flex">
          <Link className="hover:text-charcoal" href="/menu">Menu</Link>
          <Link className="hover:text-charcoal" href="/about">About</Link>
          <Link className="hover:text-charcoal" href="/faq">FAQ</Link>
          <Link className="hover:text-charcoal" href="/events">Private Dining</Link>
          <Link className="hover:text-charcoal" href="/contact">Contact</Link>
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-2">
          <a
            href="#reserve"
            className="inline-flex items-center justify-center rounded-full border border-gold px-4 py-2 text-sm font-medium text-charcoal transition hover:bg-gold/15"
            aria-label="Reserve a table"
          >
            Reserve
          </a>
        </div>
      </div>
    </header>
  );
}
