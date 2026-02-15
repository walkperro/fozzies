import { NextResponse } from "next/server";
import { updateClientById } from "@/lib/clients";
import { isAdminRequest } from "@/lib/emailMarketing";

export const runtime = "nodejs";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(req.headers))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing client id" }, { status: 400 });
  }

  let payload: { name?: string | null; unsubscribed?: boolean };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (Object.prototype.hasOwnProperty.call(payload, "name")) {
    const rawName = payload.name;
    updates.name = typeof rawName === "string" && rawName.trim() ? rawName.trim() : null;
  }
  if (typeof payload.unsubscribed === "boolean") {
    const now = new Date().toISOString();
    updates.unsubscribed = payload.unsubscribed;
    if (payload.unsubscribed) {
      updates.unsubscribed_at = now;
      updates.suppressed = true;
      updates.suppressed_reason = "unsubscribed";
      updates.suppressed_at = now;
    } else {
      updates.unsubscribed_at = null;
      updates.suppressed = false;
      updates.suppressed_reason = null;
      updates.suppressed_at = null;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, error: "No updates provided" }, { status: 400 });
  }

  const { error } = await updateClientById(id, updates);

  if (error) {
    return NextResponse.json({ ok: false, error: "Failed to update client." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
