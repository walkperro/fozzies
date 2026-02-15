import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const runtime = "nodejs";

type ReservePayload = {
  name: string;
  email: string;
  phone?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  partySize: number; // 1..20
  notes?: string;
  website?: string; // honeypot
};

function bad(msg: string, status = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status });
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

function escHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  try {
    const body = (await req.json()) as Partial<ReservePayload>;

    // Honeypot (bot trap)
    if ((body.website || "").trim().length > 0) {
      return NextResponse.json({ ok: true });
    }

    const name = (body.name || "").trim();
    const email = (body.email || "").trim();
    const phone = (body.phone || "").trim();
    const date = (body.date || "").trim();
    const time = (body.time || "").trim();
    const notes = (body.notes || "").trim();
    const partySize = Number(body.partySize);

    if (!name) return bad("Name is required");
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return bad("Valid email is required");
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return bad("Valid date is required");
    if (!time || !/^\d{2}:\d{2}$/.test(time)) return bad("Valid time is required");
    if (!Number.isFinite(partySize) || partySize < 1 || partySize > 20) {
      return bad("Party size must be 1–20");
    }

    const SUPABASE_URL = envOrNull("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = envOrNull("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[reservations] Missing Supabase configuration", {
        requestId,
        hasSupabaseUrl: !!SUPABASE_URL,
        hasServiceRoleKey: !!SUPABASE_SERVICE_ROLE_KEY,
      });
      return bad("Reservations are temporarily unavailable. Please call the restaurant.", 500);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase
      .schema("fozzies")
      .from("reservations")
      .insert({
        name,
        email,
        phone: phone || null,
        date,
        time,
        party_size: partySize,
        notes: notes || null,
        status: "new",
        source: "web",
      })
      .select("id")
      .single();

    if (error) {
      console.error("[reservations] Supabase insert failed", {
        requestId,
        error: error.message,
      });
      return bad("Could not submit reservation right now. Please try again shortly.", 500);
    }

    const RESEND_API_KEY = envOrNull("RESEND_API_KEY");
    const RESEND_FROM = normalizeEmailHeader(envOrNull("RESEND_FROM"));
    const RESERVE_TO_EMAIL = envOrNull("RESERVE_TO_EMAIL");

    if (!RESEND_API_KEY || !RESEND_FROM || !RESERVE_TO_EMAIL || !isValidFromField(RESEND_FROM)) {
      console.error("[reservations] Missing email configuration", {
        requestId,
        reservationId: data?.id || null,
        hasResendApiKey: !!RESEND_API_KEY,
        hasResendFrom: !!RESEND_FROM,
        hasReserveToEmail: !!RESERVE_TO_EMAIL,
        isResendFromValid: !!RESEND_FROM && isValidFromField(RESEND_FROM),
      });
      return bad(
        "Reservation saved, but email setup is invalid. Please call to confirm your table.",
        500
      );
    }

    const resend = new Resend(RESEND_API_KEY);

    const subject = `New Reservation Request • ${date} ${time} • Party of ${partySize}`;

    const text =
`New reservation request:

Name: ${name}
Email: ${email}
Phone: ${phone || "-"}

Date: ${date}
Time: ${time}
Party size: ${partySize}

Notes:
${notes || "-"}

Reservation ID: ${data?.id || "-"}`;

    const safeNotes = notes && notes.trim().length ? escHtml(notes) : "—";

    const sendResult = await resend.emails.send({
      from: RESEND_FROM,
      to: RESERVE_TO_EMAIL,
      subject,
      replyTo: email,
      text,
      html: `
<div style="background:#F7F4EF;padding:24px 0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid rgba(30,30,30,0.12);">
    <div style="padding:22px 22px 10px;">
      <div style="font-size:12px;letter-spacing:0.18em;color:#8E8E8E;text-transform:uppercase;">
        Reservation Request
      </div>
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.2;color:#1E1E1E;margin-top:8px;">
        ${partySize} guests • ${date} at ${time}
      </div>
      <div style="height:1px;background:rgba(200,162,74,0.55);margin:14px 0 0;"></div>
    </div>

    <div style="padding:18px 22px 22px;color:#1E1E1E;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid rgba(30,30,30,0.08);width:140px;color:#8E8E8E;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;">Name</td>
          <td style="padding:10px 0;border-bottom:1px solid rgba(30,30,30,0.08);font-size:15px;">${escHtml(name)}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid rgba(30,30,30,0.08);color:#8E8E8E;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;">Email</td>
          <td style="padding:10px 0;border-bottom:1px solid rgba(30,30,30,0.08);font-size:15px;">
            <a href="mailto:${escHtml(email)}" style="color:#1E1E1E;text-decoration:none;border-bottom:1px solid rgba(200,162,74,0.7);">${escHtml(email)}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid rgba(30,30,30,0.08);color:#8E8E8E;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;">Phone</td>
          <td style="padding:10px 0;border-bottom:1px solid rgba(30,30,30,0.08);font-size:15px;">
            ${phone ? `<a href="tel:${escHtml(phone)}" style="color:#1E1E1E;text-decoration:none;border-bottom:1px solid rgba(200,162,74,0.7);">${escHtml(phone)}</a>` : "(none)"}
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid rgba(30,30,30,0.08);color:#8E8E8E;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;">Reservation ID</td>
          <td style="padding:10px 0;border-bottom:1px solid rgba(30,30,30,0.08);font-size:15px;">${escHtml(String(data?.id || "-"))}</td>
        </tr>
      </table>

      <div style="margin-top:16px;">
        <div style="color:#8E8E8E;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:6px;">Notes</div>
        <div style="background:#F7F4EF;border:1px solid rgba(30,30,30,0.10);padding:12px;font-size:14px;line-height:1.5;">
          ${safeNotes}
        </div>
      </div>

      <div style="margin-top:16px;color:#8E8E8E;font-size:12px;">
        Source: website • Status: new
      </div>
    </div>
  </div>
</div>
      `,
    });

    if (sendResult.error) {
      console.error("[reservations] Resend delivery failed", {
        requestId,
        reservationId: data?.id || null,
        error: sendResult.error,
      });
      return bad(
        "Reservation saved, but we could not notify the team by email. Please call to confirm.",
        502
      );
    }

    console.info("[reservations] Email delivered", {
      requestId,
      reservationId: data?.id || null,
      providerId: sendResult.data?.id || null,
    });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error("[reservations] Unhandled error", {
      requestId,
      error: e instanceof Error ? e.message : String(e),
    });
    return NextResponse.json(
      { ok: false, error: "Could not submit reservation right now. Please try again shortly." },
      { status: 500 }
    );
  }
}
