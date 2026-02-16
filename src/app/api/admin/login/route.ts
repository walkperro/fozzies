import { NextResponse } from "next/server";
import { logServerEvent } from "@/lib/trackServer";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { token } = await req.json().catch(() => ({ token: "" }));
  const expected = process.env.ADMIN_TOKEN;

  if (!expected) {
    return NextResponse.json({ ok: false, error: "ADMIN_TOKEN not set" }, { status: 500 });
  }
  if (!token || token !== expected) {
    return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("fz_admin", "1", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14, // 14 days
  });
  await logServerEvent({
    event_type: "admin_login",
    page_path: "/admin/login",
    user_agent: req.headers.get("user-agent"),
    referrer: req.headers.get("referer"),
  });
  return res;
}
