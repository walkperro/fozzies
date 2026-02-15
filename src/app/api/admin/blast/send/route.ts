import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  countBlastRecipients,
  generateUnsubscribeToken,
  listBlastRecipients,
  updateClientById,
} from "@/lib/clients";
import {
  buildUnsubscribeUrl,
  envOrNull,
  isAdminRequest,
  isValidFromField,
  normalizeEmailHeader,
  renderBlastHtml,
  renderBlastText,
  sanitizeErrorMessage,
} from "@/lib/emailMarketing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = {
  subject?: string;
  body?: string;
  testEmail?: boolean;
  testTo?: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function hintFromFailures(failures: Array<{ email: string; errorMessage: string }>) {
  const combined = failures.map((f) => f.errorMessage).join(" ").toLowerCase();
  if (/verify|verified|domain|sender|from address|from email/.test(combined)) {
    return "Verify RESEND_FROM domain in Resend.";
  }
  return undefined;
}

export async function GET(req: Request) {
  if (!(await isAdminRequest(req.headers))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { count, error } = await countBlastRecipients();
  if (error) return NextResponse.json({ ok: false, error: "Could not count recipients." }, { status: 500 });
  return NextResponse.json({ ok: true, recipients: count ?? 0 });
}

export async function POST(req: Request) {
  if (!(await isAdminRequest(req.headers))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const subject = String(payload.subject ?? "").trim();
  const body = String(payload.body ?? "").trim();
  const isTest = Boolean(payload.testEmail);
  const testTo = String(payload.testTo ?? "").trim().toLowerCase();

  if (!subject || !body) {
    return NextResponse.json({ ok: false, error: "Subject and body are required." }, { status: 400 });
  }
  if (isTest && !isValidEmail(testTo)) {
    return NextResponse.json({ ok: false, error: "Enter a valid test email." }, { status: 400 });
  }

  const apiKey = envOrNull("RESEND_API_KEY");
  const from = normalizeEmailHeader(envOrNull("RESEND_FROM") ?? envOrNull("FROM_EMAIL"));
  const replyTo = envOrNull("RESERVE_TO_EMAIL");

  if (!apiKey || !from || !isValidFromField(from)) {
    return NextResponse.json(
      { ok: false, error: "Set RESEND_API_KEY and RESEND_FROM to enable blasts." },
      { status: 500 }
    );
  }

  const resend = new Resend(apiKey);
  if (isTest) {
    try {
      const { error } = await resend.emails.send({
        from,
        to: testTo,
        ...(replyTo ? { replyTo } : {}),
        subject,
        text: renderBlastText({ subject, body }),
        html: renderBlastHtml({ subject, body }),
      });

      if (error) {
        console.error("[blast.send] Test send failed", { testTo, error });
        const errorMessage = sanitizeErrorMessage(error.message);
        return NextResponse.json(
          {
            ok: false,
            sentCount: 0,
            failedCount: 1,
            failures: [{ email: testTo, errorMessage }],
            hint: hintFromFailures([{ email: testTo, errorMessage }]),
            error: `Test send failed: ${errorMessage}`,
          },
          { status: 502 }
        );
      }

      return NextResponse.json({ ok: true, mode: "test", sentCount: 1, failedCount: 0, failures: [] });
    } catch (err) {
      const errorMessage = sanitizeErrorMessage(err);
      console.error("[blast.send] Test send threw", { testTo, err });
      return NextResponse.json(
        {
          ok: false,
          sentCount: 0,
          failedCount: 1,
          failures: [{ email: testTo, errorMessage }],
          hint: hintFromFailures([{ email: testTo, errorMessage }]),
          error: `Test send failed: ${errorMessage}`,
        },
        { status: 500 }
      );
    }
  }

  const { data, error } = await listBlastRecipients();
  if (error) {
    return NextResponse.json({ ok: false, error: "Could not load recipients." }, { status: 500 });
  }

  const recipients = (data ?? []).filter((r) => !!r.email);
  if (recipients.length === 0) {
    return NextResponse.json({ ok: true, mode: "blast", sentCount: 0, failedCount: 0, failures: [] });
  }

  const failures: Array<{ email: string; errorMessage: string }> = [];
  let sentCount = 0;
  const concurrency = 3;

  const sendOne = async (recipient: { id: string; email: string; unsubscribe_token?: string | null }) => {
    let token = recipient.unsubscribe_token || "";
    if (!token) {
      token = generateUnsubscribeToken();
      const { error: tokenError } = await updateClientById(recipient.id, { unsubscribe_token: token });
      if (tokenError) {
        const errorMessage = "Could not generate unsubscribe token.";
        console.error("[blast.send] Token generation failed", { recipient, tokenError });
        return { ok: false as const, email: recipient.email, errorMessage };
      }
    }

    const unsubscribeUrl = buildUnsubscribeUrl(token);

    try {
      const { error: sendError } = await resend.emails.send({
        from,
        to: recipient.email,
        ...(replyTo ? { replyTo } : {}),
        subject,
        text: renderBlastText({ subject, body, unsubscribeUrl }),
        html: renderBlastHtml({ subject, body, unsubscribeUrl }),
      });

      if (sendError) {
        console.error("[blast.send] Delivery failed", { recipient: recipient.email, sendError });
        return { ok: false as const, email: recipient.email, errorMessage: sanitizeErrorMessage(sendError.message) };
      }

      return { ok: true as const, email: recipient.email };
    } catch (err) {
      console.error("[blast.send] Delivery threw", { recipient: recipient.email, err });
      return { ok: false as const, email: recipient.email, errorMessage: sanitizeErrorMessage(err) };
    }
  };

  for (let i = 0; i < recipients.length; i += concurrency) {
    const chunk = recipients.slice(i, i + concurrency);
    const results = await Promise.all(chunk.map(sendOne));
    for (const result of results) {
      if (result.ok) sentCount += 1;
      else failures.push({ email: result.email, errorMessage: result.errorMessage });
    }
  }

  return NextResponse.json({
    ok: true,
    mode: "blast",
    sentCount,
    failedCount: failures.length,
    failures: failures.slice(0, 5),
    hint: hintFromFailures(failures),
  });
}
