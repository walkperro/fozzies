import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

type ReservePayload = {
  name: string;
  email: string;
  phone?: string;
  date: string;      // YYYY-MM-DD
  time: string;      // HH:MM
  partySize: number; // 1..20
  notes?: string;
};

function bad(msg: string, status = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<ReservePayload>;

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
    if (!Number.isFinite(partySize) || partySize < 1 || partySize > 20) return bad("Party size must be 1–20");

    const SUPABASE_URL = process.env.SUPABASE_URL!;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return bad("Server not configured (Supabase env vars missing)", 500);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // Insert into schema: fozzies
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
      return bad(`Supabase insert failed: ${error.message}`, 500);
    }

    // Email via Resend (optional but recommended)
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const TO_EMAIL = process.env.RESERVATION_TO_EMAIL || "fozziesdining@gmail.com";
    const FROM_EMAIL = process.env.RESERVATION_FROM_EMAIL || "reservations@fozziesdining.com";

    if (RESEND_API_KEY) {
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

Reservation ID: ${data?.id}`;

      // If your domain isn't verified yet in Resend, set FROM_EMAIL to an address Resend allows for testing.
      await resend.emails.send({
      from: (process.env.RESEND_FROM || "Fozzie's <onboarding@resend.dev>"),
      to,
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
          <td style="padding:10px 0;border-bottom:1px solid rgba(30,30,30,0.08);font-size:15px;">${name}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid rgba(30,30,30,0.08);color:#8E8E8E;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;">Email</td>
          <td style="padding:10px 0;border-bottom:1px solid rgba(30,30,30,0.08);font-size:15px;">
            <a href="mailto:${email}" style="color:#1E1E1E;text-decoration:none;border-bottom:1px solid rgba(200,162,74,0.7);">${email}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid rgba(30,30,30,0.08);color:#8E8E8E;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;">Phone</td>
          <td style="padding:10px 0;border-bottom:1px solid rgba(30,30,30,0.08);font-size:15px;">
            ${phone ? `<a href="tel:${phone}" style="color:#1E1E1E;text-decoration:none;border-bottom:1px solid rgba(200,162,74,0.7);">${phone}</a>` : "(none)"}
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid rgba(30,30,30,0.08);color:#8E8E8E;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;">Party Size</td>
          <td style="padding:10px 0;border-bottom:1px solid rgba(30,30,30,0.08);font-size:15px;">${partySize}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid rgba(30,30,30,0.08);color:#8E8E8E;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;">Date</td>
          <td style="padding:10px 0;border-bottom:1px solid rgba(30,30,30,0.08);font-size:15px;">${date}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid rgba(30,30,30,0.08);color:#8E8E8E;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;">Time</td>
          <td style="padding:10px 0;border-bottom:1px solid rgba(30,30,30,0.08);font-size:15px;">${time}</td>
        </tr>
      </table>

      <div style="margin-top:16px;">
        <div style="color:#8E8E8E;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:6px;">Notes</div>
        <div style="background:#F7F4EF;border:1px solid rgba(30,30,30,0.10);padding:12px;font-size:14px;line-height:1.5;">
          ${notes && notes.trim().length ? notes.replaceAll('<','&lt;').replaceAll('>','&gt;') : "—"}
        </div>
      </div>

      <div style="margin-top:16px;color:#8E8E8E;font-size:12px;">
        Source: website • Status: new
      </div>
    </div>
  </div>
</div>
      `,
    });}

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Unknown error" }, { status: 500 });
  }
}
