import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
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
    updates.unsubscribed = payload.unsubscribed;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, error: "No updates provided" }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const { error } = await supabase.schema("fozzies").from("clients").update(updates).eq("id", id);

  if (error) {
    return NextResponse.json({ ok: false, error: "Failed to update client." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
