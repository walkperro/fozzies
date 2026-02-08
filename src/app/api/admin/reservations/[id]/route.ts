import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({} as any));

  const supabase = supabaseAdmin();

  // 1) Status update
  if (typeof body?.status === "string" && body.status.trim().length) {
    const status = body.status.trim();
    const allowed = new Set(["new", "confirmed", "declined", "completed"]);
    if (!allowed.has(status)) {
      return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
    }

    const { error } = await supabase
      .schema("fozzies")
      .from("reservations")
      .update({ status })
      .eq("id", id);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // 2) Archive / unarchive
  if (typeof body?.archive === "boolean") {
    const archived_at = body.archive ? new Date().toISOString() : null;

    const { error } = await supabase
      .schema("fozzies")
      .from("reservations")
      .update({ archived_at })
      .eq("id", id);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // 3) Soft delete (only)
  if (body?.softDelete === true) {
    const deleted_at = new Date().toISOString();

    const { error } = await supabase
      .schema("fozzies")
      .from("reservations")
      .update({ deleted_at })
      .eq("id", id);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { ok: false, error: "No valid operation provided" },
    { status: 400 }
  );
}
