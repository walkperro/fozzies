export type ContactBlock = {
  id: string;
  label: string;
  value: string;
  href?: string;
};

export type ContactPayload = {
  title: string;
  subtitle?: string;
  blocks: ContactBlock[];
  note?: string;
};

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function toNonEmptyString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function toOptionalString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function getDefaultContactPayload(): ContactPayload {
  return {
    title: "Contact",
    subtitle: "For private dining inquiries, media, or general questions.",
    blocks: [
      {
        id: makeId("contact-block"),
        label: "Email",
        value: "fozziesdining@gmail.com",
        href: "mailto:fozziesdining@gmail.com",
      },
      {
        id: makeId("contact-block"),
        label: "Instagram",
        value: "@fozziesdining",
        href: "https://instagram.com/fozziesdining",
      },
    ],
    note: "",
  };
}

function normalizeContactBlock(value: unknown): ContactBlock | null {
  if (!value || typeof value !== "object") return null;
  const block = value as Record<string, unknown>;
  const label = toNonEmptyString(block.label);
  const itemValue = toNonEmptyString(block.value);
  if (!label || !itemValue) return null;
  return {
    id: toNonEmptyString(block.id, makeId("contact-block")),
    label,
    value: itemValue,
    href: toOptionalString(block.href),
  };
}

export function parseContactPayload(value: unknown): ContactPayload | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (!Array.isArray(row.blocks)) return null;
  const defaults = getDefaultContactPayload();
  const blocks = row.blocks.map(normalizeContactBlock).filter((block): block is ContactBlock => !!block);
  if (blocks.length === 0) return null;
  return {
    title: toNonEmptyString(row.title, defaults.title),
    subtitle: toOptionalString(row.subtitle),
    blocks,
    note: toOptionalString(row.note),
  };
}

export function isAllowedContactHref(href?: string) {
  if (!href || !href.trim()) return false;
  const value = href.trim();
  if (value.startsWith("/")) return true;
  if (/^(tel:|mailto:|https?:\/\/)/i.test(value)) return true;
  return false;
}

