import { cookies } from "next/headers";

export function envOrNull(name: string) {
  const v = process.env[name];
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
}

export function normalizeEmailHeader(v: string | null) {
  if (!v) return null;
  return v.trim().replace(/^['"]+|['"]+$/g, "");
}

export function isValidFromField(v: string) {
  const email = "[^\\s@<>]+@[^\\s@<>]+\\.[^\\s@<>]+";
  return new RegExp(`^${email}$`).test(v) || new RegExp(`^[^<>\\r\\n]+<\\s*${email}\\s*>$`).test(v);
}

export async function isAdminRequest(headers: Headers) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return false;

  const jar = await cookies();
  const cookieOk = jar.get("fz_admin")?.value === "1";
  const headerOk = headers.get("x-admin-token") === expected;
  return cookieOk || headerOk;
}

export function sanitizeErrorMessage(value: unknown) {
  const base =
    typeof value === "string"
      ? value
      : value instanceof Error
        ? value.message
        : "Unknown provider error";
  return base.replace(/\s+/g, " ").trim().slice(0, 220);
}

export function escHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function bodyToHtml(body: string) {
  return escHtml(body).replaceAll("\n", "<br/>");
}

export function defaultSiteUrl() {
  return envOrNull("NEXT_PUBLIC_SITE_URL") || "https://fozziesdining.com";
}

export function renderEmailFooter(input?: { includeComplianceLine?: boolean; unsubscribeUrl?: string }) {
  const includeComplianceLine = Boolean(input?.includeComplianceLine);
  const unsubscribeUrl = input?.unsubscribeUrl;
  const siteUrl = "https://fozziesdining.com";

  return `
<div style="margin-top:18px;border-top:1px solid rgba(200,162,74,0.3);padding-top:14px;color:#CFCFCF;font-size:12px;line-height:1.65;">
  ${includeComplianceLine ? `<div style="color:#9E9E9E;font-size:12px;margin-bottom:8px;">You're receiving this because you joined Fozzie's updates.</div>` : ""}
  ${
    unsubscribeUrl
      ? `<div style="margin-bottom:10px;"><a href="${escHtml(unsubscribeUrl)}" style="color:#D8D2C6;text-decoration:underline;font-size:11px;">Unsubscribe</a></div>`
      : ""
  }
  <div>Fozzie's Dining</div>
  <div>Cookeville, TN</div>
  <div><a href="${siteUrl}" style="color:#D8D2C6;text-decoration:underline;">fozziesdining.com</a></div>
</div>
  `;
}

export function renderLuxuryEmailHtml(input: {
  eyebrow?: string;
  heading: string;
  contentHtml: string;
  footerHtml?: string;
}) {
  const eyebrow = input.eyebrow || "Fozzie's Dining";
  return `
<div style="background:#0F0F0F;padding:28px 0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;border-top:1px solid rgba(200,162,74,0.12);border-bottom:1px solid rgba(200,162,74,0.12);">
  <div style="max-width:640px;margin:0 auto;background:#1B1B1B;border:1px solid rgba(200,162,74,0.28);box-shadow:inset 0 1px 0 rgba(255,255,255,0.03),inset 0 -1px 0 rgba(255,255,255,0.02);">
    <div style="height:6px;background:linear-gradient(180deg,rgba(200,162,74,0.14),rgba(200,162,74,0));"></div>
    <div style="padding:22px 22px 10px;">
      <div style="font-size:12px;letter-spacing:0.18em;color:#B6B6B6;text-transform:uppercase;">
        ${escHtml(eyebrow)}
      </div>
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.2;color:#F7F4EF;margin-top:8px;">
        ${escHtml(input.heading)}
      </div>
      <div style="height:1px;background:rgba(200,162,74,0.7);margin:14px 0 0;"></div>
    </div>
    <div style="padding:18px 22px 22px;color:#EFEAE0;">
      <div style="font-size:15px;line-height:1.7;">
        ${input.contentHtml}
      </div>
      ${input.footerHtml || ""}
    </div>
    <div style="height:6px;background:linear-gradient(0deg,rgba(200,162,74,0.14),rgba(200,162,74,0));"></div>
  </div>
</div>
  `;
}

export function renderBlastHtml(input: { subject: string; body: string; unsubscribeUrl?: string }) {
  const html = renderLuxuryEmailHtml({
    eyebrow: "Fozzie's Dining",
    heading: input.subject,
    contentHtml: `<div style="padding-top:2px;padding-bottom:6px;">${bodyToHtml(input.body)}</div>`,
    footerHtml: renderEmailFooter({
      includeComplianceLine: true,
      unsubscribeUrl: input.unsubscribeUrl,
    }),
  });

  if (process.env.NODE_ENV !== "production") {
    const hasExpectedMarkers =
      html.includes("Fozzie&#039;s Dining") &&
      html.includes("rgba(200,162,74,0.7)") &&
      html.includes("fozziesdining.com") &&
      (!input.unsubscribeUrl || html.includes("Unsubscribe"));
    if (!hasExpectedMarkers) {
      console.warn("[emailMarketing] renderBlastHtml sanity check failed");
    }
  }

  return html;
}

export function renderBlastText(input: { subject: string; body: string; unsubscribeUrl?: string }) {
  return `${input.subject}\n\n${input.body}${input.unsubscribeUrl ? `\n\nUnsubscribe: ${input.unsubscribeUrl}` : ""}\n\nFozzie's Dining\nCookeville, TN\nfozziesdining.com`;
}

export function buildUnsubscribeUrl(token: string) {
  const base = defaultSiteUrl();
  return `${base.replace(/\/$/, "")}/unsubscribe?token=${encodeURIComponent(token)}`;
}
