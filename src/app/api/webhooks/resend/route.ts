import { NextResponse } from "next/server";
import { Resend } from "resend";
import { logEmailEvent } from "@/lib/clients";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

type WebhookEnvelope = {
  type?: string;
  data?: {
    to?: string | string[];
    reason?: string;
    type?: string;
    subType?: string;
    subtype?: string;
    bounce?: { type?: string; subType?: string; subtype?: string } | null;
  } | null;
};

function toLowerEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function uniqueEmailsFromEvent(evt: WebhookEnvelope) {
  const to = evt.data?.to;
  const list = Array.isArray(to) ? to : typeof to === "string" ? [to] : [];
  return [...new Set(list.map(toLowerEmail).filter(Boolean))];
}

function suppressReasonForEvent(evt: WebhookEnvelope) {
  const eventType = String(evt.type || "");
  if (eventType === "email.complained") return "complaint";

  if (eventType === "email.bounced") {
    const subType = evt.data?.bounce?.subType || evt.data?.bounce?.subtype || evt.data?.subType || evt.data?.subtype;
    const bounceType = evt.data?.bounce?.type || evt.data?.type;
    if (subType || bounceType) {
      return `bounce:${String(subType || "unknown")}/${String(bounceType || "unknown")}`;
    }
    return "bounce";
  }

  if (eventType === "email.suppressed") {
    const reason = evt.data?.reason;
    return reason ? `suppressed:${String(reason)}` : "suppressed";
  }

  return null;
}

function isDebug() {
  return process.env.NODE_ENV !== "production";
}

export async function POST(req: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "Missing webhook secret" }, { status: 500 });
  }

  const payload = await req.text();
  const svixId = req.headers.get("svix-id") || "";
  const svixTimestamp = req.headers.get("svix-timestamp") || "";
  const svixSignature = req.headers.get("svix-signature") || "";

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ ok: false, error: "Missing webhook headers" }, { status: 400 });
  }

  let event: WebhookEnvelope;
  try {
    const resend = new Resend(process.env.RESEND_API_KEY || "webhook");
    event = resend.webhooks.verify({
      payload,
      webhookSecret: secret,
      headers: {
        id: svixId,
        timestamp: svixTimestamp,
        signature: svixSignature,
      },
    }) as WebhookEnvelope;
  } catch (error) {
    if (isDebug()) {
      console.error("[resend.webhook] signature verification failed", error);
    }
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });
  }

  const type = String(event.type || "");
  const emails = uniqueEmailsFromEvent(event);
  const reason = suppressReasonForEvent(event);

  await logEmailEvent({ type, email: emails[0] || null, payload: event });

  if (!["email.bounced", "email.complained", "email.suppressed"].includes(type) || emails.length === 0 || !reason) {
    if (isDebug()) {
      console.info("[resend.webhook] ignored event", { type, emailsCount: emails.length });
    }
    return NextResponse.json({ ok: true });
  }

  const now = new Date().toISOString();
  const supabase = supabaseAdmin();

  for (const email of emails) {
    const updates: Record<string, string | boolean | null> = {
      suppressed: true,
      suppressed_at: now,
      suppressed_reason: reason,
    };

    if (type === "email.complained") {
      updates.unsubscribed = true;
      updates.unsubscribed_at = now;
    }

    const { error } = await supabase.schema("fozzies").from("clients").update(updates).eq("email", email);
    if (error && isDebug()) {
      console.error("[resend.webhook] client update failed", { type, email, error: error.message });
    }
  }

  if (isDebug()) {
    console.info("[resend.webhook] processed", { type, emailsCount: emails.length, reason });
  }

  return NextResponse.json({ ok: true });
}
