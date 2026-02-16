import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

type TrackBody = {
  event_type?: unknown;
  page_path?: unknown;
  referrer?: unknown;
  utm_source?: unknown;
  utm_medium?: unknown;
  utm_campaign?: unknown;
  utm_term?: unknown;
  utm_content?: unknown;
  visitor_id?: unknown;
  user_agent?: unknown;
  device?: unknown;
  meta?: unknown;
};

const WINDOW_MS = 60_000;
const LIMIT_PER_WINDOW = 20;
const rateMap = new Map<string, { count: number; resetAt: number }>();

function toText(v: unknown, max: number) {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function rateLimitKey(visitorId: string | null, ip: string | null) {
  return visitorId || ip || "anonymous";
}

function isRateLimited(key: string) {
  const now = Date.now();
  const item = rateMap.get(key);
  if (!item || now > item.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (item.count >= LIMIT_PER_WINDOW) return true;
  item.count += 1;
  rateMap.set(key, item);
  return false;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as TrackBody;
    const eventType = toText(body.event_type, 80);
    if (!eventType) {
      return NextResponse.json({ ok: false, error: "event_type is required" }, { status: 400 });
    }

    const visitorId = toText(body.visitor_id, 120);
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0]?.trim() || null : null;
    const key = rateLimitKey(visitorId, ip);
    if (isRateLimited(key)) {
      return NextResponse.json({ ok: false, error: "Rate limit exceeded" }, { status: 429 });
    }

    let meta: Record<string, unknown> = {};
    if (body.meta && typeof body.meta === "object" && !Array.isArray(body.meta)) {
      meta = body.meta as Record<string, unknown>;
    }

    const supabase = supabaseAdmin();
    const { error } = await supabase.schema("fozzies").from("analytics_events").insert({
      event_type: eventType,
      page_path: toText(body.page_path, 500),
      referrer: toText(body.referrer, 1000),
      utm_source: toText(body.utm_source, 120),
      utm_medium: toText(body.utm_medium, 120),
      utm_campaign: toText(body.utm_campaign, 160),
      utm_term: toText(body.utm_term, 160),
      utm_content: toText(body.utm_content, 160),
      visitor_id: visitorId,
      user_agent: toText(body.user_agent, 400),
      device: toText(body.device, 20),
      meta,
    });

    if (error) {
      return NextResponse.json({ ok: false, error: "Failed to write analytics event" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
}
