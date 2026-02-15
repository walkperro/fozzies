import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { escHtml, renderEmailFooter, renderLuxuryEmailHtml } from "@/lib/emailMarketing";

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
      text:
        `${headline}\n\n${bodyText}\n\nRequested: ${r.date} ${r.time} (Party of ${r.party_size})` +
        `\n\nFozzie's Dining\nCookeville, TN\nfozziesdining.com`,
      html: renderLuxuryEmailHtml({
        eyebrow: "Fozzie's Dining",
        heading: headline,
        contentHtml: `
Hi ${escHtml(String(r.name || ""))},<br/><br/>
${escHtml(bodyText)}
<div style="margin-top:14px;background:rgba(247,244,239,0.08);border:1px solid rgba(200,162,74,0.35);padding:12px;font-size:14px;line-height:1.5;">
  <b>Request:</b> ${escHtml(String(r.date))} at ${escHtml(String(r.time))} • Party of ${escHtml(String(r.party_size))}
</div>
<div style="margin-top:14px;color:#B6B6B6;font-size:12px;">
  If you have questions, reply to this email.
</div>
        `,
        footerHtml: renderEmailFooter(),
      }),
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
