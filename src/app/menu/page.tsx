export default function MenuPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-4xl text-charcoal">Menu</h1>
      <p className="mt-3 max-w-2xl text-softgray">
        Dinner menu — updated seasonally.
      </p>

      <section className="mt-10 rounded-2xl border border-charcoal/10 bg-white/40 p-6">
        <div className="text-sm text-softgray">Coming next:</div>
        <div className="mt-2 text-charcoal">
          A beautifully formatted menu with sections, gluten-free markers, and print-friendly layout.
        </div>
      </section>
    </main>
  );
}
