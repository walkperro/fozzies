import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const ALLOWED = new Set(["new", "confirmed", "declined", "completed"]);

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const body = await req.json().catch(() => ({} as any));
  const status = body?.status != null ? String(body.status) : null;
  const archive = body?.archive;         // boolean
  const softDelete = body?.softDelete;   // boolean

  const patch: Record<string, any> = {};

  // Status update
  if (status !== null) {
    if (!ALLOWED.has(status)) {
      return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
    }
    patch.status = status;
  }

  // Archive toggle
  if (typeof archive === "boolean") {
    patch.archived_at = archive ? new Date().toISOString() : null;
  }

  // Soft delete
  if (softDelete === true) {
    patch.deleted_at = new Date().toISOString();
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "No valid fields to update" }, { status: 400 });
  }

  const supabase = supabaseAdmin();

  const { error } = await supabase
    .schema("fozzies")
    .from("reservations")
    .update(patch)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
