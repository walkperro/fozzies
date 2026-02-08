import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const allowed = new Set(["new", "confirmed", "declined", "completed"]);

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const body = await req.json().catch(() => ({} as any));
  const supabase = supabaseAdmin();

  // Build update object based on payload
  const update: Record<string, any> = {};

  if (typeof body.status === "string") {
    const status = body.status.toString();
    if (!allowed.has(status)) {
      return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
    }
    update.status = status;
  }

  if (typeof body.archive === "boolean") {
    update.archived_at = body.archive ? new Date().toISOString() : null;
  }

  if (body.softDelete === true) {
    update.deleted_at = new Date().toISOString();
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ ok: false, error: "No updates provided" }, { status: 400 });
  }

  const { error } = await supabase
    .schema("fozzies")
    .from("reservations")
    .update(update)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
