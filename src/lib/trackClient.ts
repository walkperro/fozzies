type TrackPayload = {
  page_path?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  visitor_id?: string;
  user_agent?: string;
  device?: "mobile" | "desktop" | "tablet" | "unknown";
  meta?: Record<string, unknown>;
};

export async function track(event_type: string, payload: TrackPayload = {}) {
  if (typeof window === "undefined") return;

  try {
    await fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event_type, ...payload }),
      keepalive: true,
    });
  } catch {
    // Best-effort analytics should not interrupt UX.
  }
}
