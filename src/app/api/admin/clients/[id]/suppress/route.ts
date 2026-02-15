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

  let reason: "manual" | "hard_bounce" | "complaint" = "manual";
  try {
    const payload = (await req.json().catch(() => ({}))) as { reason?: string };
    if (payload.reason === "hard_bounce" || payload.reason === "complaint" || payload.reason === "manual") {
      reason = payload.reason;
    }
  } catch {
    // keep default
  }

  const { error } = await updateClientById(id, {
    suppressed: true,
    suppressed_reason: reason,
    suppressed_at: new Date().toISOString(),
  });

  if (error) return NextResponse.json({ ok: false, error: "Failed to suppress client." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
