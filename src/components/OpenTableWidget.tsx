"use client";

import { useEffect, useRef } from "react";

export default function OpenTableWidget() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const rid = process.env.NEXT_PUBLIC_OPENTABLE_RID;
    if (!rid || !hostRef.current) return;

    hostRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src =
      `https://www.opentable.com/widget/reservation/loader?rid=${encodeURIComponent(rid)}` +
      `&domain=com&type=standard&theme=standard&lang=en-US&overlay=false&iframe=true`;

    hostRef.current.appendChild(script);

    return () => {
      if (hostRef.current) hostRef.current.innerHTML = "";
    };
  }, []);

  return <div ref={hostRef} />;
}
