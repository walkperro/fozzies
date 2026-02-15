"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import ReserveForm from "@/components/ReserveForm";

type AnnouncementItem = {
  id: string;
  title: string;
  body: string;
};

type BannerSettings = {
  enabled: boolean;
  text: string;
  mode: "static" | "marquee";
  speed: number;
};

export default function HomePage() {
  const slides = useMemo(
    () => [
      { src: "/gallery/dining_room_1.png", alt: "Dining room ambiance" },
      { src: "/gallery/chef_greeting_guests.png", alt: "Chef greeting guests" },
      { src: "/gallery/dining_room_2.png", alt: "Bar and dining room atmosphere" },
      { src: "/gallery/couples_dinner.png", alt: "An intimate dining moment" },
    ],
    []
  );

  const [active, setActive] = useState(0);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [expandedAnnouncementIds, setExpandedAnnouncementIds] = useState<string[]>([]);
  const [collapsedDesktopAnnouncementIds, setCollapsedDesktopAnnouncementIds] = useState<string[]>([]);
  const [isDesktop, setIsDesktop] = useState(false);
  const [banner, setBanner] = useState<BannerSettings | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterBusy, setNewsletterBusy] = useState(false);
  const [newsletterStatus, setNewsletterStatus] = useState("");

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % slides.length), 9000);
    return () => clearInterval(id);
  }, [slides.length]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsDesktop(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadAnnouncements() {
      try {
        const res = await fetch("/api/announcements?limit=3", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || !json.ok) return;
        if (!cancelled) setAnnouncements(Array.isArray(json.items) ? json.items : []);
      } catch {
        if (!cancelled) setAnnouncements([]);
      }
    }
    loadAnnouncements();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadBanner() {
      try {
        const res = await fetch("/api/banner", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || cancelled) return;
        setBanner(json as BannerSettings);
      } catch {
        if (!cancelled) setBanner(null);
      }
    }
    loadBanner();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onNewsletterSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNewsletterBusy(true);
    setNewsletterStatus("");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: newsletterEmail,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Subscription failed");

      setNewsletterStatus(json.status === "already_subscribed" ? "You’re already on the list." : "You’re on the list.");
      if (json.status === "subscribed") {
        setNewsletterEmail("");
      }
    } catch (err) {
      setNewsletterStatus(err instanceof Error ? err.message : "Subscription failed");
    } finally {
      setNewsletterBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pt-6 pb-14 sm:px-6 sm:pt-8">
      {banner?.enabled && banner.text ? (
        <section className="mb-6 overflow-hidden border-y border-gold/50 bg-gradient-to-r from-cream via-ivory to-cream shadow-sm">
          {banner.mode === "marquee" ? (
            <div className="overflow-hidden px-3 py-2.5">
              <div
                key={`${banner.mode}-${banner.speed}-${banner.text}`}
                className="fz-marquee inline-flex min-w-full whitespace-nowrap font-serif text-[15px] text-charcoal"
                style={{
                  animationDuration: `${banner.speed}s`,
                }}
              >
                <span className="px-10">{banner.text}</span>
                <span className="px-10">{banner.text}</span>
                <span className="px-10">{banner.text}</span>
              </div>
            </div>
          ) : (
            <div className="px-4 py-2.5 text-center font-serif text-[15px] text-charcoal">{banner.text}</div>
          )}
        </section>
      ) : null}

      {/* HERO CAROUSEL */}
      <section className="relative overflow-hidden border border-charcoal/10 bg-cream shadow-sm">
        {/* Background slides */}
        <div className="absolute inset-0">
          {slides.map((sl, idx) => (
            <div
              key={sl.src}
              className={[
                "absolute inset-0 transition-opacity duration-[2400ms] ease-in-out",
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

          {/* Gold tint + vignette for readability (no blur) */}
          <div className="absolute inset-0 bg-[rgba(200,162,74,0.22)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.72)] via-[rgba(0,0,0,0.30)] to-[rgba(0,0,0,0.72)]" />
        </div>

        {/* Foreground content */}
        <div className="relative z-10 px-6 py-14 sm:px-10 sm:py-16 text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.92)]">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 whitespace-nowrap text-[11px] tracking-[0.18em] sm:text-xs sm:tracking-[0.22em] text-white/90">
              <span className="h-px w-10 bg-gold/70" />
              CHEF-DRIVEN • COOKEVILLE, TN
              <span className="h-px w-10 bg-gold/70" />
            </div>

            <div className="mt-7 flex justify-center">
              <Image
                src="/brand/title_tagline_hq_white.png"
                alt="Fozzie's — An Elevated Dining Experience"
                width={820}
                height={240}
                priority
                className="h-auto w-[94%] max-w-[640px] sm:max-w-[760px] "
              />
            </div>

            <p className="mx-auto mt-6 max-w-xl text-lg text-white/90">
              Crafted for memorable evenings, celebrations, and the moments worth dressing up for.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href="#reserve"
                className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-charcoal no-underline transition hover:opacity-90"
              >
                Reserve a Table
              </a>
              <a
                href="/menu"
                className="rounded-full border border-white/35 px-5 py-2.5 text-sm font-medium text-white/90 no-underline transition hover:border-white/55"
              >
                View Menu
              </a>
            </div>
          </div>
        </div>
      </section>

      {announcements.length > 0 ? (
        <section className="mx-auto mt-16 w-full max-w-6xl border border-charcoal/10 bg-cream p-6 shadow-sm sm:p-8">
          <div className="mx-auto w-full">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 whitespace-nowrap text-[11px] tracking-[0.18em] sm:text-xs sm:tracking-[0.22em] text-softgray">
                <span className="h-px w-10 bg-gold/70" />
                ANNOUNCEMENTS
                <span className="h-px w-10 bg-gold/70" />
              </div>
              <h2 className="mt-4 font-serif text-3xl text-charcoal">Latest Updates</h2>
              <div className="mx-auto mt-5 h-px w-48 bg-gold/60" />
            </div>

            <div className="mx-auto mt-8 grid max-w-6xl gap-4 lg:grid-cols-2">
              {announcements.map((item) => {
                const isExpanded = isDesktop
                  ? !collapsedDesktopAnnouncementIds.includes(item.id)
                  : expandedAnnouncementIds.includes(item.id);
                const shouldTruncate = item.body.length > 180;
                const previewBody =
                  !shouldTruncate || isExpanded ? item.body : `${item.body.slice(0, 180).trim()}...`;

                return (
                  <article key={item.id} className="border border-charcoal/10 bg-ivory p-4">
                    <h3 className="font-serif text-2xl text-charcoal">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-softgray">{previewBody}</p>
                    {shouldTruncate ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (isDesktop) {
                            setCollapsedDesktopAnnouncementIds((prev) =>
                              prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                            );
                            return;
                          }
                          setExpandedAnnouncementIds((prev) =>
                            prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                          );
                        }}
                        className="mt-3 text-sm font-medium text-charcoal underline decoration-gold/70 underline-offset-4"
                      >
                        {isExpanded ? "Read Less" : "Read More"}
                      </button>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* Chef */}
      <section className="mt-16 grid gap-10 md:grid-cols-12 md:items-center">
        <div className="md:col-span-6">
          <div className="overflow-hidden rounded-none md:border border-charcoal/10 bg-cream shadow-sm transition hover:shadow-md">
            <div className="relative aspect-[3/4] md:h-[520px] w-full">
              <Image
                src="/gallery/chef_hero.jpg"
                alt="Chef greeting guests at Fozzie’s"
                fill
                className="object-cover md:object-contain md:object-top object-center transition duration-500"
                sizes="(min-width: 768px) 50vw, 100vw"
                priority={false}
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-6 text-center md:text-left">
          <div className="inline-flex items-center gap-3 whitespace-nowrap text-[11px] tracking-[0.18em] sm:text-xs sm:tracking-[0.22em] text-softgray">
            <span className="h-px w-10 bg-gold/70" />
            THE CHEF
            <span className="h-px w-10 bg-gold/70" />
          </div>

          <h2 className="mt-4 font-serif text-3xl text-charcoal">
            Hospitality first. Flavor always.
          </h2>

          <p className="mt-4 text-[15px] leading-7 text-softgray">
            From scratch-made classics to elevated seasonal plates — every detail is built around your table: warm hospitality, confident flavors, and an unhurried, white-tablecloth experience.
          </p>

        </div>
      </section>

      {/* Signature Dishes */}
      <section className="mt-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 whitespace-nowrap text-[11px] tracking-[0.18em] sm:text-xs sm:tracking-[0.22em] text-softgray">
            <span className="h-px w-10 bg-gold/70" />
            SIGNATURE DISHES
            <span className="h-px w-10 bg-gold/70" />
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
              className="overflow-hidden rounded-none md:border border-charcoal/10 bg-cream shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover object-center transition duration-500 hover:scale-[1.01]"
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
          <div className="inline-flex items-center gap-3 whitespace-nowrap text-[11px] tracking-[0.18em] sm:text-xs sm:tracking-[0.22em] text-softgray">
            <span className="h-px w-10 bg-gold/70" />
            THE ATMOSPHERE
            <span className="h-px w-10 bg-gold/70" />
          </div>
          <h2 className="mt-4 font-serif text-3xl text-charcoal">Timeless. Intimate. Refined.</h2>
          <div className="mx-auto mt-5 h-px w-48 bg-gold/60" />
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-12">
          <div className="md:col-span-6 overflow-hidden border border-charcoal/10 bg-cream shadow-sm">
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

          <div className="md:col-span-6 overflow-hidden border border-charcoal/10 bg-cream shadow-sm">
            <div className="relative aspect-[16/10] w-full">
              <Image
                src="/gallery/couple_bar.png"
                alt="Table setting and warm lighting"
                fill
                className="object-cover object-[50%_50%]"
                sizes="(min-width: 768px) 40vw, 100vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Reserve */}
      <section className="mx-auto mt-16 w-full max-w-4xl border border-charcoal/10 bg-cream p-6 shadow-sm sm:p-8">
        <div className="text-center">
          <h2 className="font-serif text-3xl text-charcoal">Stay in the Fozzie&apos;s Circle</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-softgray">
            Seasonal menus, special evenings, and reservation updates — occasionally.
          </p>
        </div>

        <form onSubmit={onNewsletterSubmit} className="mx-auto mt-6 grid max-w-2xl gap-3 sm:grid-cols-[1fr_auto]">
          <input
            type="email"
            required
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            placeholder="Email address"
            className="w-full border border-charcoal/15 bg-ivory px-3 py-2 text-charcoal outline-none"
          />
          <button
            disabled={newsletterBusy}
            className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-charcoal transition hover:opacity-90 disabled:opacity-70"
          >
            {newsletterBusy ? "Joining..." : "Join"}
          </button>
        </form>
        {newsletterStatus ? <p className="mt-3 text-center text-sm text-softgray">{newsletterStatus}</p> : null}
      </section>

      <section id="reserve" className="mt-16 scroll-mt-24">
        <ReserveForm />
      </section>



    </main>
  );
}
