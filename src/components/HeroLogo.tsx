"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function HeroLogo() {
  const [tagIn, setTagIn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTagIn(true), 140);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center">
      {/* Wordmark: regular (no animation) */}
      <Image
        src="/brand/title_solo_hq.png"
        alt="Fozzie's"
        width={980}
        height={260}
        priority
        className="h-auto w-[92%] max-w-[640px] sm:max-w-[760px]"
      />

      {/* Tagline: stagger in */}
      <div
        className={[
          "mt-3 flex items-center justify-center gap-3 text-[12px] sm:text-[13px]",
          "tracking-[0.22em] text-gold/70",
          "transition-all duration-500 ease-out",
          tagIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[6px]",
        ].join(" ")}
      >
        <span className="h-px w-12 bg-gold/50" />
        <span className="uppercase">An Elevated Dining Experience</span>
        <span className="h-px w-12 bg-gold/50" />
      </div>
    </div>
  );
}
