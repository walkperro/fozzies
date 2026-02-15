import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const runtime = "nodejs";

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function envOrNull(name: string) {
  const v = process.env[name];
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
}

function normalizeEmailHeader(v: string | null) {
  if (!v) return null;
  return v.trim().replace(/^['"]+|['"]+$/g, "");
}

function isValidFromField(v: string) {
  const email = "[^\\s@<>]+@[^\\s@<>]+\\.[^\\s@<>]+";
  return new RegExp(`^${email}$`).test(v) || new RegExp(`^[^<>\\r\\n]+<\\s*${email}\\s*>$`).test(v);
}

async function isAuthed(req: NextRequest) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return false;

  // Next 16 typing in your project: cookies() -> Promise<ReadonlyRequestCookies>
  const jar = await cookies();
  const cookieOk = jar.get("fz_admin")?.value === "1";
  const headerOk = req.headers.get("x-admin-token") === expected;

  return cookieOk || headerOk;
}

function escHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const requestId = crypto.randomUUID();
  try {
    if (!(await isAuthed(req))) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    const kind = String(body.kind || "confirmed") as "confirmed" | "declined" | "reschedule";
    const message = String(body.message || "").trim();

    const supabase = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { persistSession: false },
    });

    const { data: r, error } = await supabase
      .schema("fozzies")
      .from("reservations")
      .select("id,name,email,date,time,party_size,status")
      .eq("id", id)
      .single();

    if (error || !r) {
      return NextResponse.json({ ok: false, error: "Reservation not found" }, { status: 404 });
    }
    if (!r.email) {
      return NextResponse.json({ ok: false, error: "Reservation has no email" }, { status: 400 });
    }

    const resendApiKey = envOrNull("RESEND_API_KEY");
    const from = normalizeEmailHeader(envOrNull("RESEND_FROM"));
    const replyTo = envOrNull("RESERVE_TO_EMAIL");

    if (!resendApiKey || !from || !replyTo || !isValidFromField(from)) {
      console.error("[admin.notify] Missing email configuration", {
        requestId,
        reservationId: id,
        hasResendApiKey: !!resendApiKey,
        hasResendFrom: !!from,
        hasReserveToEmail: !!replyTo,
        isResendFromValid: !!from && isValidFromField(from),
      });
      return NextResponse.json(
        {
          ok: false,
          error: "Email is misconfigured on the server. RESEND_FROM must be a valid sender format.",
        },
        { status: 500 }
      );
    }

    const resend = new Resend(resendApiKey);

    let subject = "";
    let headline = "";
    let bodyText = "";

    if (kind === "confirmed") {
      subject = `Reservation Confirmed • ${r.date} ${r.time} • Party of ${r.party_size}`;
      headline = "Your reservation is confirmed";
      bodyText = message || `We look forward to seeing you at ${r.time} on ${r.date}.`;
    } else if (kind === "declined") {
      subject = `Reservation Update • ${r.date} ${r.time}`;
      headline = "We couldn’t confirm that time";
      bodyText =
        message || "Please reply with another preferred time and we’ll do our best to accommodate.";
    } else {
      subject = `Reservation Request • Alternative Time`;
      headline = "Can we move your reservation?";
      bodyText = message || "Reply with what works best and we’ll confirm.";
    }

    const sendResult = await resend.emails.send({
      from,
      to: r.email,
      replyTo,
      subject,
      text: `${headline}\n\n${bodyText}\n\nRequested: ${r.date} ${r.time} (Party of ${r.party_size})`,
      html: `
<div style="background:#F7F4EF;padding:24px 0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid rgba(30,30,30,0.12);">
    <div style="padding:22px 22px 10px;">
      <div style="font-size:12px;letter-spacing:0.18em;color:#8E8E8E;text-transform:uppercase;">
        Fozzie's Dining
      </div>
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.2;color:#1E1E1E;margin-top:8px;">
        ${escHtml(headline)}
      </div>
      <div style="height:1px;background:rgba(200,162,74,0.55);margin:14px 0 0;"></div>
    </div>
    <div style="padding:18px 22px 22px;color:#1E1E1E;">
      <div style="font-size:15px;line-height:1.6;margin-bottom:14px;">
        Hi ${escHtml(String(r.name || ""))},<br/><br/>
        ${escHtml(bodyText)}
      </div>

      <div style="background:#F7F4EF;border:1px solid rgba(30,30,30,0.10);padding:12px;font-size:14px;line-height:1.5;">
        <b>Request:</b> ${escHtml(String(r.date))} at ${escHtml(String(r.time))} • Party of ${escHtml(
          String(r.party_size)
        )}
      </div>

      <div style="margin-top:14px;color:#8E8E8E;font-size:12px;">
        If you have questions, reply to this email.
      </div>
    </div>
  </div>
</div>
      `,
    });

    if (sendResult.error) {
      console.error("[admin.notify] Resend delivery failed", {
        requestId,
        reservationId: id,
        kind,
        error: sendResult.error,
      });
      return NextResponse.json(
        { ok: false, error: "Email could not be delivered. Please try again in a minute." },
        { status: 502 }
      );
    }

    console.info("[admin.notify] Email delivered", {
      requestId,
      reservationId: id,
      kind,
      providerId: sendResult.data?.id || null,
    });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error("[admin.notify] Unhandled error", {
      requestId,
      error: e instanceof Error ? e.message : String(e),
    });
    return NextResponse.json(
      { ok: false, error: "Email could not be sent right now. Please try again shortly." },
      { status: 500 }
    );
  }
}
