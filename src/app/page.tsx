"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
export default function HomePage() {
  const slides = useMemo(
    () => [
      { src: "/gallery/dining_room_1.png", alt: "Dining room ambiance" },
      { src: "/gallery/dining_room_2.png", alt: "Dining room bar ambiance" },
      { src: "/gallery/chef_greeting_guests.png", alt: "Chef greeting guests" },
    ],
    []
  );

  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, 5200);
    return () => clearInterval(id);
  }, [slides.length]);


  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <section className="relative overflow-hidden border border-charcoal/10 bg-cream shadow-sm">
      {/* Background slides */}
      <div className="absolute inset-0">
        {slides.map((sl, idx) => (
          <div
            key={sl.src}
            className={[
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              idx === active ? "opacity-100" : "opacity-0",
            ].join(" ")}
          >
            <Image
              src={sl.src}
              alt={sl.alt}
              fill
              priority={idx === 0}
              className="object-cover"
              sizes="(min-width: 768px) 1100px, 100vw"
            />
          </div>
        ))}

        {/* Soft luxury tint + readability */}
        <div className="absolute inset-0 bg-cream/70 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-cream/40 via-cream/70 to-cream/95" />
      </div>

      {/* Foreground content */}
      <div className="relative px-6 py-14 sm:px-10 sm:py-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 text-xs tracking-[0.22em] text-softgray">
            <span className="h-px w-10 bg-gold/50" />
            CHEF-OWNED • COOKEVILLE, TN
            <span className="h-px w-10 bg-gold/50" />
          </div>

          <div className="mt-7 flex justify-center">
            <Image
              src="/brand/title_tagline_hq.png"
              alt="Fozzie's — An Elevated Dining Experience"
              width={820}
              height={240}
              priority
              className="h-auto w-[94%] max-w-[640px] sm:max-w-[760px]"
            />
          </div>

          <p className="mx-auto mt-6 max-w-xl text-lg text-charcoal/80">
            Crafted for memorable evenings, celebrations, and the moments worth dressing up for.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
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
      </div>
    </section>

      {/* Chef */}
      <section className="mt-16 grid gap-10 md:grid-cols-12 md:items-center">
        <div className="md:col-span-6">
          <div className="overflow-hidden border border-charcoal/10 bg-cream shadow-sm transition hover:shadow-md">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src="/gallery/chef_hero.jpg"
                alt="Chef greeting guests at Fozzie’s"
                fill
                className="object-cover transition duration-500 hover:scale-[1.01]"
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
                className="snap-center shrink-0 w-[82%] overflow-hidden border border-charcoal/10 bg-cream shadow-sm"
              >
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover"
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
              className="overflow-hidden border border-charcoal/10 bg-cream shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition duration-500 hover:scale-[1.01]"
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
          <div className="md:col-span-7 overflow-hidden border border-charcoal/10 bg-cream shadow-sm">
            <div className="relative aspect-[16/10] w-full">
              <Image
                src="/gallery/dining_room_1.png"
                alt="Dining room ambience"
                fill
                className="object-cover"
                sizes="(min-width: 768px) 60vw, 100vw"
              />
            </div>
          </div>

          <div className="md:col-span-5 overflow-hidden border border-charcoal/10 bg-cream shadow-sm">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src="/gallery/chef_greeting_guests.png"
                alt="Table setting and warm lighting"
                fill
                className="object-cover"
                sizes="(min-width: 768px) 40vw, 100vw"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
