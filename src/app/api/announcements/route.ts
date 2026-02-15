import { NextResponse } from "next/server";
import { listPublicAnnouncements } from "@/lib/announcements";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const rawLimit = Number(url.searchParams.get("limit") ?? "3");
  const limit = Number.isFinite(rawLimit) ? rawLimit : 3;

  const { data, error } = await listPublicAnnouncements(limit);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { ok: true, items: data ?? [] },
    { headers: { "cache-control": "no-store, max-age=0" } }
  );
}
