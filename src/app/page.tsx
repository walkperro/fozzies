import Image from "next/image";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <section className="grid gap-10 md:grid-cols-12 md:items-start">
        <div className="md:col-span-7 text-center md:text-left">
          <div className="inline-flex items-center gap-3 text-xs tracking-[0.22em] text-softgray">
            <span className="h-px w-10 bg-gold/50" />
            CHEF-OWNED • COOKEVILLE, TN
            <span className="h-px w-10 bg-gold/50" />
          </div>

          <div className="mt-6 flex justify-center md:justify-start">
            <Image
              src="/brand/title_tagline_hq.png"
              alt="Fozzie's — An Elevated Dining Experience"
              width={820}
              height={240}
              priority
              className="h-auto w-[94%] max-w-[640px] sm:max-w-[760px]"
            />
          </div>

          <p className="mt-6 mx-auto max-w-xl text-lg text-charcoal/80 md:mx-0">
            Crafted for memorable evenings, celebrations, and the moments worth dressing up for.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
            <a
              href="#reserve"
              className="rounded-full border border-gold px-5 py-2.5 text-sm font-medium text-charcoal no-underline transition hover:bg-gold/15"
            >
              Reserve a Table
            </a>
            <a
              href="/menu"
              className="rounded-full border border-charcoal/15 px-5 py-2.5 text-sm font-medium text-charcoal/80 no-underline transition hover:border-charcoal/25 hover:text-charcoal"
            >
              View Menu
            </a>
          </div>
        </div>
      
      </section>

      {/* Chef */}
      <section className="mt-16 grid gap-10 md:grid-cols-12 md:items-center">
        <div className="md:col-span-6">
          <div className="overflow-hidden rounded-3xl border border-charcoal/10 bg-cream shadow-sm transition hover:shadow-md">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src="/gallery/chef_hero.jpg"
                alt="Chef greeting guests at Fozzie’s"
                fill
                className="object-contain transition duration-500 hover:scale-[1.02]"
                sizes="(min-width: 768px) 50vw, 100vw"
                priority={false}
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-6 text-center md:text-left">
          <div className="inline-flex items-center gap-3 text-xs tracking-[0.22em] text-softgray">
            <span className="h-px w-10 bg-gold/50" />
            THE CHEF
            <span className="h-px w-10 bg-gold/50" />
          </div>

          <h2 className="mt-4 font-serif text-3xl text-charcoal">
            Hospitality first. Flavor always.
          </h2>

          <p className="mt-4 text-[15px] leading-7 text-softgray">
            Chef-driven plates, warm service, and a dining room built for celebrations,
            date nights, and the moments worth dressing up for.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <a
              href="/menu"
              className="inline-flex items-center justify-center rounded-full border border-gold px-5 py-2 text-sm font-medium text-charcoal no-underline transition hover:bg-gold/15"
            >
              View Menu
            </a>
            <a
              href="#reserve"
              className="inline-flex items-center justify-center rounded-full bg-charcoal px-5 py-2 text-sm font-medium text-cream no-underline transition hover:opacity-90"
            >
              Reserve a Table
            </a>
          </div>
        </div>
      </section>

      {/* Signature Dishes */}
      <section className="mt-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 text-xs tracking-[0.22em] text-softgray">
            <span className="h-px w-10 bg-gold/50" />
            SIGNATURE DISHES
            <span className="h-px w-10 bg-gold/50" />
          </div>
          <h2 className="mt-4 font-serif text-3xl text-charcoal">A few guest favorites</h2>
          <div className="mx-auto mt-5 h-px w-48 bg-gold/60" />
        </div>

        {/* Mobile: scroll-snap carousel | Desktop: grid */}
        <div className="mt-10 md:hidden">
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
            {[
              { src: "/gallery/main_dish.png", alt: "Signature main dish" },
              { src: "/gallery/salad_dish.png", alt: "Seasonal salad" },
              { src: "/gallery/desert_dish.png", alt: "House dessert" },
            ].map((img) => (
              <div
                key={img.src}
                className="snap-center shrink-0 w-[82%] overflow-hidden rounded-3xl border border-charcoal/10 bg-cream shadow-sm"
              >
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-contain"
                    sizes="80vw"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 hidden md:grid md:grid-cols-3 md:gap-6">
          {[
            { src: "/gallery/main_dish.png", alt: "Signature main dish" },
            { src: "/gallery/salad_dish.png", alt: "Seasonal salad" },
            { src: "/gallery/desert_dish.png", alt: "House dessert" },
          ].map((img) => (
            <div
              key={img.src}
              className="overflow-hidden rounded-3xl border border-charcoal/10 bg-cream shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-contain transition duration-500 hover:scale-[1.02]"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dining Room Atmosphere */}
      <section className="mt-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 text-xs tracking-[0.22em] text-softgray">
            <span className="h-px w-10 bg-gold/50" />
            THE ATMOSPHERE
            <span className="h-px w-10 bg-gold/50" />
          </div>
          <h2 className="mt-4 font-serif text-3xl text-charcoal">Timeless. Intimate. Refined.</h2>
          <div className="mx-auto mt-5 h-px w-48 bg-gold/60" />
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-12">
          <div className="md:col-span-7 overflow-hidden rounded-3xl border border-charcoal/10 bg-cream shadow-sm">
            <div className="relative aspect-[16/10] w-full">
              <Image
                src="/gallery/dining_room_1.png"
                alt="Dining room ambience"
                fill
                className="object-contain"
                sizes="(min-width: 768px) 60vw, 100vw"
              />
            </div>
          </div>

          <div className="md:col-span-5 overflow-hidden rounded-3xl border border-charcoal/10 bg-cream shadow-sm">
            <div className="relative aspect-[4/5] w-full">
              <Image
                src="/gallery/chef_greeting_guests.png"
                alt="Table setting and warm lighting"
                fill
                className="object-contain"
                sizes="(min-width: 768px) 40vw, 100vw"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
