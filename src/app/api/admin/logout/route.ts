import { NextResponse } from "next/server";

function clearAdminCookie(res: NextResponse) {
  res.cookies.set("fz_admin", "", { path: "/", maxAge: 0 });
}

function shouldReturnJson(req: Request) {
  const accept = req.headers.get("accept") || "";
  return accept.includes("application/json");
}

function redirectToLogin(req: Request) {
  return NextResponse.redirect(new URL("/admin/login", req.url));
}

export async function GET(req: Request) {
  const res = redirectToLogin(req);
  clearAdminCookie(res);
  return res;
}

export async function POST(req: Request) {
  if (shouldReturnJson(req)) {
    const res = NextResponse.json({ ok: true });
    clearAdminCookie(res);
    return res;
  }
  const res = redirectToLogin(req);
  clearAdminCookie(res);
  return res;
}
