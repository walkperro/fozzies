import { NextResponse } from "next/server";
import { updateClientById } from "@/lib/clients";
import { isAdminRequest } from "@/lib/emailMarketing";

export const runtime = "nodejs";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(req.headers))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) return NextResponse.json({ ok: false, error: "Missing client id" }, { status: 400 });

  const { error } = await updateClientById(id, {
    unsubscribed: false,
    unsubscribed_at: null,
    suppressed: false,
    suppressed_reason: null,
    suppressed_at: null,
  });

  if (error) return NextResponse.json({ ok: false, error: "Failed to resubscribe client." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
