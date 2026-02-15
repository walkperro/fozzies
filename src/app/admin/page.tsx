import Link from "next/link";

const CARDS = [
  { href: "/admin/reservations", title: "Reservations", note: "Manage incoming reservation requests." },
  { href: "/admin/announcements", title: "Announcements", note: "Create and publish homepage announcements." },
  { href: "/admin/clients", title: "Clients", note: "Newsletter list and blast composer skeleton." },
  { href: "/admin/menu", title: "Menu Editor", note: "Edit menu content persisted in site settings." },
  { href: "/admin/menu-pdf", title: "Menu PDF", note: "Upload/swap the downloadable menu PDF." },
  { href: "/admin/activity", title: "Activity", note: "Placeholder for analytics and activity feeds." },
];

export default function AdminDashboardPage() {
  return (
    <main>
      <div>
        <div className="text-[11px] tracking-[0.18em] text-softgray">ADMIN</div>
        <h2 className="mt-2 font-serif text-4xl text-charcoal">Admin Dashboard</h2>
        <p className="mt-2 text-sm text-softgray">Choose a section to manage site operations.</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="block border border-charcoal/10 bg-ivory p-5 transition hover:border-gold/70 hover:shadow-sm"
          >
            <h3 className="font-serif text-2xl text-charcoal">{card.title}</h3>
            <p className="mt-2 text-sm text-softgray">{card.note}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
