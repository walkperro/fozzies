import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ApplyPayload = {
  full_name?: unknown;
  email?: unknown;
  phone?: unknown;
  position?: unknown;
  availability?: unknown;
  message?: unknown;
  website?: unknown;
  company?: unknown;
  consent?: unknown;
};

const POSITIONS = new Set([
  "Host",
  "Server",
  "Bartender",
  "Line Cook",
  "Prep Cook",
  "Dishwasher",
  "Manager",
  "Other",
]);

const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 10;
const ipAttempts = new Map<string, number[]>();

function getIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip")?.trim() || "unknown";
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

function asString(input: unknown) {
  return typeof input === "string" ? input.trim() : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hashIp(ip: string) {
  const salt = process.env.APPLICANT_IP_SALT;
  if (!salt || !ip || ip === "unknown") return null;
  return createHash("sha256").update(`${ip}:${salt}`).digest("hex");
}

export async function POST(req: Request) {
  const ip = getIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  let payload: ApplyPayload;
  try {
    payload = (await req.json()) as ApplyPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const fullName = asString(payload.full_name);
  const email = asString(payload.email).toLowerCase();
  const phone = asString(payload.phone);
  const position = asString(payload.position);
  const availability = asString(payload.availability);
  const message = asString(payload.message);
  const website = asString(payload.website);
  const company = asString(payload.company);
  const consent = payload.consent === true;

  if (company) {
    return NextResponse.json({ ok: true });
  }

  if (!fullName || fullName.length > 120) {
    return NextResponse.json({ ok: false, error: "Please provide your full name." }, { status: 400 });
  }
  if (!isValidEmail(email) || email.length > 180) {
    return NextResponse.json({ ok: false, error: "Please provide a valid email." }, { status: 400 });
  }
  if (!POSITIONS.has(position)) {
    return NextResponse.json({ ok: false, error: "Please select a valid position." }, { status: 400 });
  }
  if (!message || message.length > 4000) {
    return NextResponse.json({ ok: false, error: "Please provide a short message or experience summary." }, { status: 400 });
  }
  if (!consent) {
    return NextResponse.json({ ok: false, error: "You must agree to the Privacy Policy." }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const { error } = await supabase.schema("fozzies").from("job_applicants").insert({
    full_name: fullName,
    email,
    phone: phone || null,
    position,
    availability: availability || null,
    message,
    website: website || null,
    status: "new",
    source: "website",
    user_agent: req.headers.get("user-agent") || null,
    ip_hash: hashIp(ip),
  });

  if (error) {
    return NextResponse.json({ ok: false, error: "Could not submit application right now." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
