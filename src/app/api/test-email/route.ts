import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

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

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();

  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const expectedToken = envOrNull("ADMIN_TOKEN");
    const token = req.headers.get("x-admin-token") || String(body?.token || "");

    if (!expectedToken) {
      return NextResponse.json({ ok: false, error: "ADMIN_TOKEN is not configured." }, { status: 500 });
    }
    if (!token || token !== expectedToken) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const resendApiKey = envOrNull("RESEND_API_KEY");
    const from = normalizeEmailHeader(envOrNull("RESEND_FROM"));
    const fallbackTo = envOrNull("RESERVE_TO_EMAIL");
    const to = String(body.to || "").trim() || fallbackTo;

    if (!resendApiKey || !from || !to || !isValidFromField(from)) {
      console.error("[test-email] Missing email configuration", {
        requestId,
        hasResendApiKey: !!resendApiKey,
        hasResendFrom: !!from,
        hasRecipient: !!to,
        isResendFromValid: !!from && isValidFromField(from),
      });
      return NextResponse.json(
        {
          ok: false,
          error:
            "Email is misconfigured. Set RESEND_API_KEY, RESERVE_TO_EMAIL, and a valid RESEND_FROM sender format.",
        },
        { status: 500 }
      );
    }

    const resend = new Resend(resendApiKey);
    const nowIso = new Date().toISOString();
    const subject = `Fozzies Email Test • ${nowIso}`;

    const sendResult = await resend.emails.send({
      from,
      to,
      replyTo: fallbackTo || undefined,
      subject,
      text: `This is a test email from /api/test-email.\nrequestId=${requestId}\ntime=${nowIso}`,
      html: `<p>This is a test email from <code>/api/test-email</code>.</p><p>requestId=<code>${requestId}</code><br/>time=<code>${nowIso}</code></p>`,
    });

    if (sendResult.error) {
      console.error("[test-email] Resend delivery failed", {
        requestId,
        error: sendResult.error,
      });
      return NextResponse.json(
        { ok: false, error: "Email provider rejected the send request." },
        { status: 502 }
      );
    }

    console.info("[test-email] Email delivered", {
      requestId,
      providerId: sendResult.data?.id || null,
      to,
    });

    return NextResponse.json({
      ok: true,
      id: sendResult.data?.id || null,
      to,
      requestId,
    });
  } catch (e: unknown) {
    console.error("[test-email] Unhandled error", {
      requestId,
      error: e instanceof Error ? e.message : String(e),
    });
    return NextResponse.json(
      { ok: false, error: "Could not send test email right now." },
      { status: 500 }
    );
  }
}
