import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const { id } = ctx.params;
  const body = await req.json().catch(() => ({}));
  const status = (body.status || "").toString();

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
