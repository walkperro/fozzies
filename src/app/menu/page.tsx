import Link from "next/link";

type Item = {
  name: string;
  gf?: boolean;
  desc?: string[];
};

const beginnings: Item[] = [
  { name: "Sweet Homemade Rolls", desc: ["Honey compound butter"] },

  { name: "Avery’s Fried Pickles", gf: true, desc: ["Housemade pickles", "Sriracha aioli or jalapeño ranch"] },

  { name: "Stuffed Portobello Caps", gf: true, desc: ["Spinach, sun-dried tomatoes, goat cheese, bell peppers, onions, shaved parmesan"] },

  { name: "Waka Waka Shrimp", gf: true, desc: ["Crispy Gulf shrimp", "Waka Waka sauce"] },

  { name: "Soup de Lour", desc: ["Cup or bowl", "Daily chef’s selection"] },

  { name: "Seasonal Flatbread" },

  { name: "Crab Cakes", desc: ["Lump crab meat", "Corn relish", "Waka Waka sauce"] },
];

const mains: Item[] = [
  { name: "Shrimp & Grits", gf: true, desc: ["Gulf shrimp", "Seasonal vegetables", "Gorda grits"] },

  { name: "Sara’s Southwest Pasta", desc: ["Southwest cream sauce", "Fettuccine", "Grilled chicken", "Can sub shrimp or salmon"] },

  { name: "Smoked Pork Belly", gf: true, desc: ["Sweet chili glaze", "Jasmine rice", "Haricots verts", "Sriracha aioli"] },

  { name: "B & C’s Salmon", gf: true, desc: ["Blackened salmon fillet", "Hot honey citrus glaze", "Sweet potato hash", "Crispy Brussels"] },

  { name: "Fozzie’s Burger of the Week", desc: ["Fries", "Creole ketchup"] },

  { name: "Steak Fries", gf: true, desc: ["Wagyu flat iron", "Fries", "Housemade horseradish", "Creole ketchup", "Add over-easy eggs"] },

  { name: "Fresh Gulf Catch", gf: true, desc: ["Chef’s selection", "Grilled or blackened", "Gorda grits", "Seasonal vegetables"] },

  { name: "Seasonal Salad", desc: ["Can add chicken, shrimp, or salmon"] },

  { name: "Spanish Salad", desc: ["Can add chicken, shrimp, or salmon"] },
];

const desserts: Item[] = [
  { name: "Bread Pudding" },
  { name: "Mousse", desc: ["Chef’s selection"] },
  { name: "Brownie Sundae", gf: true, desc: ["Salted caramel ice cream"] },
  { name: "Crème Brûlée", gf: true },
];

function Section({ title, items }: { title: string; items: Item[] }) {
  return (
    <section className="mt-12">
      <h2 className="font-serif text-3xl tracking-tight text-charcoal">{title}</h2>
      <div className="mt-3 h-px w-16 bg-gold/60" />
      <div className="mt-7 space-y-8">
        {items.map((it) => (
          <div key={it.name}>
            <div className="flex items-baseline gap-2">
              <h3 className="font-serif text-xl text-charcoal">{it.name}</h3>
              {it.gf ? <span className="text-gold text-sm">*</span> : null}
            </div>
            {it.desc?.length ? (
              <div className="mt-2 space-y-1 text-[15px] leading-6 text-softgray">
                {it.desc.map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function MenuPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
      {/* Hero (digital printed menu vibe) */}
      <header className="text-center">
        <div className="mx-auto max-w-3xl">
          <div className="font-serif text-4xl text-charcoal">Menu</div>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs tracking-[0.22em] text-softgray">
            <span className="h-px w-10 bg-gold/60" />
            CHEF-OWNED • COOKEVILLE, TN
            <span className="h-px w-10 bg-gold/60" />
          </div>

          <div className="mt-8 text-sm text-softgray">
            <span className="text-gold">*</span> Gluten Free <span className="mx-2">•</span> Split Fee Charge — $10
          </div>
        </div>
      </header>

      {/* Sections */}
      <Section title="Beginnings" items={beginnings} />
      <Section title="Mains" items={mains} />
      <Section title="Desserts" items={desserts} />

      {/* Footer blocks (menu back page equivalent) */}
      <footer className="mt-16 border-t border-charcoal/10 pt-10">
        <div className="grid gap-10 text-center md:grid-cols-3 md:text-left">
          <div className="text-softgray">
            <div className="text-xs tracking-[0.18em] text-softgray">HOURS</div>
            <div className="mt-3 text-[15px] leading-6">
              <div className="text-charcoal/80">Dinner</div>
              Tues–Sat • 5–9 PM
              <div className="mt-3 text-charcoal/80">Happy Hour</div>
              Tues–Sat • 4–6 PM
            </div>
          </div>

          <div className="text-softgray">
            <div className="text-xs tracking-[0.18em] text-softgray">RESERVATIONS</div>
            <div className="mt-3 text-[15px] leading-6">
              OpenTable
              <div className="mt-3 text-charcoal/80">Dress Code</div>
              Smart casual
              <div className="mt-3 text-charcoal/80">Tip</div>
              Reservations recommended
            </div>
          </div>

          <div className="text-softgray">
            <div className="text-xs tracking-[0.18em] text-softgray">CONNECT</div>
            <div className="mt-3 text-[15px] leading-6">
              Facebook — <span className="text-charcoal/70">Coming soon</span>
              <br />
              Instagram — <span className="text-charcoal/70">Coming soon</span>
              <div className="mt-5">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-full border border-gold px-4 py-2 text-sm font-medium text-charcoal no-underline transition hover:bg-gold/15"
                >
                  Back Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
