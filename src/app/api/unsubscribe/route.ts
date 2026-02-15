import { NextResponse } from "next/server";
import { findClientByToken, unsubscribeClientByToken } from "@/lib/clients";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderResultHtml(message: string) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Fozzie's • Email Preferences</title>
  <style>
    :root { color-scheme: light; }
    body { margin: 0; background: #f7f4ef; color: #1e1e1e; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
    .wrap { max-width: 680px; margin: 0 auto; padding: 56px 18px; }
    .card { background: #fbf8f3; border: 1px solid rgba(30,30,30,.12); padding: 34px 28px; text-align: center; }
    .eyebrow { font-size: 11px; letter-spacing: .18em; color: #777; }
    h1 { font-family: Georgia, 'Times New Roman', serif; font-size: 40px; margin: 14px 0 8px; }
    p { margin: 0; color: #555; line-height: 1.7; font-size: 14px; }
    .btn { display: inline-block; margin-top: 24px; border: 1px solid #c8a24a; border-radius: 9999px; padding: 9px 16px; color: #1e1e1e; text-decoration: none; font-size: 14px; }
  </style>
</head>
<body>
  <main class="wrap">
    <section class="card">
      <div class="eyebrow">FOZZIE'S</div>
      <h1>Email Preferences</h1>
      <p>${escHtml(message)}</p>
      <a class="btn" href="/">Back Home</a>
    </section>
  </main>
</body>
</html>`;
}

async function processUnsubscribe(token: string) {
  const cleaned = token.trim();
  if (!cleaned) {
    return { ok: false as const, statusCode: 400, error: "Invalid token" };
  }

  const { data, error } = await findClientByToken(cleaned);
  if (error) return { ok: false as const, statusCode: 500, error: "Could not process unsubscribe." };
  if (!data) return { ok: false as const, statusCode: 404, error: "Invalid token" };

  if (data.unsubscribed) {
    return { ok: true as const, status: "already_unsubscribed" as const };
  }

  const { error: updateError } = await unsubscribeClientByToken(cleaned);
  if (updateError) return { ok: false as const, statusCode: 500, error: "Could not process unsubscribe." };

  return { ok: true as const, status: "unsubscribed" as const };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";
  const result = await processUnsubscribe(token);

  const message = !result.ok
    ? result.statusCode === 404 || result.statusCode === 400
      ? "This link is invalid or expired."
      : "Could not update preferences right now. Please try again later."
    : result.status === "already_unsubscribed"
      ? "You’ve already been unsubscribed."
      : "You’re all set. You won’t receive further updates.";

  return new Response(renderResultHtml(message), {
    status: result.ok ? 200 : result.statusCode,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export async function POST(req: Request) {
  let payload: { token?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const token = String(payload.token ?? "");
  const result = await processUnsubscribe(token);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.statusCode });
  }
  return NextResponse.json({ ok: true, status: result.status });
}
