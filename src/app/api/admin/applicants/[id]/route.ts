import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/emailMarketing";
import { updateApplicantById, type ApplicantStatus } from "@/lib/applicants";

export const runtime = "nodejs";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(req.headers))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) return NextResponse.json({ ok: false, error: "Missing applicant id" }, { status: 400 });

  let payload: { status?: unknown; admin_note?: unknown };
  try {
    payload = (await req.json()) as { status?: unknown; admin_note?: unknown };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const updates: { status?: ApplicantStatus; admin_note?: string | null } = {};

  if (payload.status !== undefined) {
    const status = String(payload.status);
    if (status !== "new" && status !== "reviewed" && status !== "archived") {
      return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
    }
    updates.status = status;
  }

  if (payload.admin_note !== undefined) {
    const note = typeof payload.admin_note === "string" ? payload.admin_note.trim().slice(0, 4000) : "";
    updates.admin_note = note || null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, error: "No updates provided" }, { status: 400 });
  }

  const { error } = await updateApplicantById(id, updates);
  if (error) return NextResponse.json({ ok: false, error: "Failed to update applicant." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(req.headers))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) return NextResponse.json({ ok: false, error: "Missing applicant id" }, { status: 400 });

  const { error } = await updateApplicantById(id, {
    status: "archived",
    deleted_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ ok: false, error: "Failed to delete applicant." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
