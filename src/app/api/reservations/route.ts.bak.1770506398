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
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        subject,
        text,
      });
    }

    return NextResponse.json({ ok: true, id: data?.id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Unknown error" }, { status: 500 });
  }
}
