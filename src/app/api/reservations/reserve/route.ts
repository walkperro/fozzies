import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const ReservationSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(120),
  phone: z.string().max(40).optional().or(z.literal("")),
  partySize: z.coerce.number().int().min(1).max(20),
  date: z.string().min(8).max(20), // YYYY-MM-DD
  time: z.string().min(3).max(10), // HH:MM
  notes: z.string().max(500).optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")), // honeypot
});

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ReservationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid form data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Honeypot: if filled, pretend success but do nothing.
    if (parsed.data.website && parsed.data.website.trim().length > 0) {
      return NextResponse.json({ ok: true });
    }

    const { name, email, phone, partySize, date, time, notes } = parsed.data;

    const supabase = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"));

    // ✅ Insert into the *fozzies* schema
    const { error: dbErr } = await supabase
      .schema("fozzies")
      .from("reservations")
      .insert({
        name,
        email,
        phone: phone || null,
        party_size: partySize,
        date,
        time,
        notes: notes || null,
        source: "website",
        status: "new",
      });

    if (dbErr) throw dbErr;

    const resend = new Resend(env("RESEND_API_KEY"));
    const from = process.env.RESEND_FROM || "Fozzie's Reservations <onboarding@resend.dev>";
    const to = process.env.RESERVE_TO_EMAIL || "fozziesdining@gmail.com";

    const subject = `New reservation request — ${partySize} on ${date} at ${time}`;

    const text =
`New reservation request

Name: ${name}
Email: ${email}
Phone: ${phone || "(none)"}
Party size: ${partySize}
Date: ${date}
Time: ${time}

Notes:
${notes || "(none)"}
`;

    await resend.emails.send({
      from,
      to,
      subject,
      text,
      replyTo: email,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
