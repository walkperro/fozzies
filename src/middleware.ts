import { NextResponse, type NextRequest } from "next/server";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

export function middleware(req: NextRequest) {
  // Allow login endpoint through
  if (req.nextUrl.pathname.startsWith("/api/admin/login")) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get("fz_admin")?.value;
  const tokenSet = !!process.env.ADMIN_TOKEN;

  // If token isn't even configured, block admin area hard
  if (!tokenSet) {
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ ok: false, error: "ADMIN_TOKEN not set" }, { status: 500 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("err", "not_configured");
    return NextResponse.redirect(url);
  }

  // Cookie must exist
  if (cookie !== "1") {
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
