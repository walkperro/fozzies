import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const runtime = "nodejs";

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const kind = (body.kind || "confirmed") as "confirmed" | "declined" | "reschedule";
    const message = String(body.message || "").trim();

    const supabase = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { persistSession: false },
    });

    const { data: r, error } = await supabase
      .schema("fozzies")
      .from("reservations")
      .select("id,name,email,date,time,party_size,notes,status")
      .eq("id", id)
      .single();

    if (error || !r) {
      return NextResponse.json({ ok: false, error: "Reservation not found" }, { status: 404 });
    }

    const resend = new Resend(env("RESEND_API_KEY"));
    const from = process.env.RESEND_FROM || "Fozzie's <onboarding@resend.dev>";

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
      bodyText = message || "Please reply with another preferred time and we’ll do our best to accommodate.";
    } else {
      subject = `Reservation Request • Alternative Time`;
      headline = "Can we move your reservation?";
      bodyText = message || "Reply with what works best and we’ll confirm.";
    }

    await resend.emails.send({
      from,
      to: r.email,
      replyTo: "fozziesdining@gmail.com",
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
        ${headline}
      </div>
      <div style="height:1px;background:rgba(200,162,74,0.55);margin:14px 0 0;"></div>
    </div>
    <div style="padding:18px 22px 22px;color:#1E1E1E;">
      <div style="font-size:15px;line-height:1.6;margin-bottom:14px;">
        Hi ${r.name},<br/><br/>
        ${bodyText}
      </div>

      <div style="background:#F7F4EF;border:1px solid rgba(30,30,30,0.10);padding:12px;font-size:14px;line-height:1.5;">
        <b>Request:</b> ${r.date} at ${r.time} • Party of ${r.party_size}
      </div>

      <div style="margin-top:14px;color:#8E8E8E;font-size:12px;">
        If you have questions, reply to this email.
      </div>
    </div>
  </div>
</div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Server error" }, { status: 500 });
  }
}
