import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/emailMarketing";
import { listApplicants, type ApplicantStatus } from "@/lib/applicants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await isAdminRequest(req.headers))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status");
  const status =
    statusParam === "new" || statusParam === "reviewed" || statusParam === "archived"
      ? (statusParam as ApplicantStatus)
      : undefined;

  const { data, error } = await listApplicants(status);
  if (error) {
    return NextResponse.json({ ok: false, error: "Failed to load applicants." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, items: data ?? [] });
}
