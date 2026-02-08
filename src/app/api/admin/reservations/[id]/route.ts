import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const body = await req.json().catch(() => ({} as any));
  const status = (body?.status || "").toString();

  const allowed = new Set(["new", "confirmed", "declined", "completed"]);
  if (!allowed.has(status)) {
    return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
  }

  const supabase = supabaseAdmin();

  const { error } = await supabase
    .schema("fozzies")
    .from("reservations")
    .update({ status })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
