export default function AdminActivityPage() {
  return (
    <main>
      <div>
        <div className="text-[11px] tracking-[0.18em] text-softgray">ADMIN</div>
        <h2 className="mt-2 font-serif text-4xl text-charcoal">Activity</h2>
        <p className="mt-2 text-sm text-softgray">Placeholder for analytics/events.</p>
      </div>

      <section className="mt-8 border border-charcoal/10 bg-ivory p-5">
        <h3 className="font-serif text-2xl text-charcoal">TODO Checklist</h3>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-softgray">
          <li>Track admin actions (announcement edits, menu saves, PDF updates, reservation status changes).</li>
          <li>Define event schema and retention window.</li>
          <li>Add dashboard charts for reservations, newsletter growth, and page engagement.</li>
          <li>Pipe structured logs into analytics destination.</li>
        </ul>
      </section>
    </main>
  );
}
