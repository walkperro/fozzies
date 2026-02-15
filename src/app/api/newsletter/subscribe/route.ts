import { NextResponse } from "next/server";
import { findClientByEmail, upsertClientSubscription } from "@/lib/clients";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 8;
const ipAttempts = new Map<string, number[]>();

function getIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return "unknown";
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const attempts = (ipAttempts.get(ip) || []).filter((ts) => now - ts < WINDOW_MS);
  if (attempts.length >= MAX_ATTEMPTS) {
    ipAttempts.set(ip, attempts);
    return true;
  }
  attempts.push(now);
  ipAttempts.set(ip, attempts);
  return false;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  const ip = getIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many signup attempts. Please try again shortly." },
      { status: 429 }
    );
  }

  let payload: { email?: string; name?: string } = {};
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const email = String(payload.email ?? "").trim().toLowerCase();
  const name = String(payload.name ?? "").trim();

  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  }

  const existing = await findClientByEmail(email);
  if (existing.error) {
    return NextResponse.json({ ok: false, error: existing.error.message }, { status: 500 });
  }

  if (existing.data && existing.data.unsubscribed === false) {
    return NextResponse.json({ ok: true, status: "already_subscribed" as const });
  }

  const { error } = await upsertClientSubscription({ email, name: name || null });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  // TODO: replace in-memory throttling with durable rate limiting (Redis/Upstash) for multi-instance deploys.
  return NextResponse.json({ ok: true, status: "subscribed" as const });
}
