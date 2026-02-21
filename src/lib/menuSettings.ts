import { MENU_META, MENU_SECTIONS, type MenuItem, type MenuMeta, type MenuSection } from "@/app/menu/menuData";

export type MenuFooterBlock = {
  hours: Array<{ label: string; value: string }>;
  reservationsText: string;
  reservationsDetails: Array<{ label: string; value: string }>;
  connectLinks: Array<{ label: string; href?: string }>;
};

export type MenuPayload = {
  meta: MenuMeta;
  sections: MenuSection[];
  footerBlock?: MenuFooterBlock;
};

function toStringOrDefault(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function normalizeLabelValueList(
  value: unknown,
  fallback: Array<{ label: string; value: string }>
): Array<{ label: string; value: string }> {
  if (!Array.isArray(value)) return fallback;
  const rows = value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const row = entry as Record<string, unknown>;
      return {
        label: toStringOrDefault(row.label, ""),
        value: toStringOrDefault(row.value, ""),
      };
    })
    .filter((entry): entry is { label: string; value: string } => !!entry && !!entry.label && !!entry.value);

  return rows.length > 0 ? rows : fallback;
}

function toOptionalString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function normalizeFooterConnectLinks(
  value: unknown,
  fallback: Array<{ label: string; href?: string }>
): Array<{ label: string; href?: string }> {
  if (!Array.isArray(value)) return fallback;
  const rows: Array<{ label: string; href?: string }> = value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const row = entry as Record<string, unknown>;
      const label = toStringOrDefault(row.label, "");
      if (!label) return null;
      return {
        label,
        href: toOptionalString(row.href, ""),
      };
    })
    .filter((entry) => !!entry) as Array<{ label: string; href?: string }>;

  return rows.length > 0 ? rows : fallback;
}

function socialValueToHref(value: string) {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^@/.test(trimmed)) return `https://instagram.com/${trimmed.replace(/^@+/, "")}`;
  return "";
}

export function deriveFooterBlockFromMeta(meta: Pick<MenuMeta, "hours" | "reservations" | "faq" | "social">): MenuFooterBlock {
  return {
    hours: meta.hours.map((entry) => ({ ...entry })),
    reservationsText: meta.reservations,
    reservationsDetails: meta.faq.map((entry) => ({ ...entry })),
    connectLinks: meta.social.map((entry) => ({
      label: `${entry.label} — ${entry.value}`,
      href: socialValueToHref(entry.value),
    })),
  };
}

function normalizeFooterBlock(value: unknown, fallback: MenuFooterBlock): MenuFooterBlock {
  if (!value || typeof value !== "object") {
    return {
      hours: fallback.hours.map((entry) => ({ ...entry })),
      reservationsText: fallback.reservationsText,
      reservationsDetails: fallback.reservationsDetails.map((entry) => ({ ...entry })),
      connectLinks: fallback.connectLinks.map((entry) => ({ ...entry })),
    };
  }
  const footer = value as Record<string, unknown>;
  return {
    hours: normalizeLabelValueList(footer.hours, fallback.hours),
    reservationsText: toStringOrDefault(footer.reservationsText, fallback.reservationsText),
    reservationsDetails: normalizeLabelValueList(footer.reservationsDetails, fallback.reservationsDetails),
    connectLinks: normalizeFooterConnectLinks(footer.connectLinks, fallback.connectLinks),
  };
}

function normalizeMenuMeta(value: unknown): MenuMeta {
  if (!value || typeof value !== "object") return { ...MENU_META };
  const meta = value as Record<string, unknown>;

  return {
    title: toStringOrDefault(meta.title, MENU_META.title),
    subtitle: toStringOrDefault(meta.subtitle, MENU_META.subtitle),
    glutenFreeNote: toStringOrDefault(meta.glutenFreeNote, MENU_META.glutenFreeNote),
    splitFee: toStringOrDefault(meta.splitFee, MENU_META.splitFee),
    reservations: toStringOrDefault(meta.reservations, MENU_META.reservations),
    hours: normalizeLabelValueList(meta.hours, MENU_META.hours),
    faq: normalizeLabelValueList(meta.faq, MENU_META.faq),
    social: normalizeLabelValueList(meta.social, MENU_META.social),
  };
}

function normalizeMenuItem(value: unknown): MenuItem | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const name = toStringOrDefault(item.name, "");
  if (!name) return null;

  const rawDesc = Array.isArray(item.desc) ? item.desc : [];
  const desc = rawDesc
    .map((line) => (typeof line === "string" ? line.trim() : ""))
    .filter((line) => !!line);

  const rawGlutenFree =
    typeof item.glutenFree === "boolean"
      ? item.glutenFree
      : typeof item.gf === "boolean"
        ? item.gf
        : undefined;

  return {
    id: typeof item.id === "string" && item.id.trim() ? item.id : undefined,
    name,
    price: typeof item.price === "string" ? item.price.trim() || undefined : undefined,
    glutenFree: rawGlutenFree,
    gf: rawGlutenFree,
    desc: desc.length > 0 ? desc : undefined,
  };
}

function normalizeMenuSection(value: unknown): MenuSection | null {
  if (!value || typeof value !== "object") return null;
  const section = value as Record<string, unknown>;
  const title = toStringOrDefault(section.title, "");
  if (!title) return null;

  const items = Array.isArray(section.items)
    ? section.items.map(normalizeMenuItem).filter((item): item is MenuItem => !!item)
    : [];

  return {
    id: typeof section.id === "string" && section.id.trim() ? section.id : undefined,
    title,
    subtitle: typeof section.subtitle === "string" && section.subtitle.trim() ? section.subtitle : undefined,
    items,
  };
}

export function getDefaultMenuPayload(): MenuPayload {
  const meta: MenuMeta = {
    ...MENU_META,
    hours: MENU_META.hours.map((h) => ({ ...h })),
    faq: MENU_META.faq.map((f) => ({ ...f })),
    social: MENU_META.social.map((s) => ({ ...s })),
  };
  return {
    meta,
    sections: MENU_SECTIONS.map((section) => ({
      ...section,
      items: section.items.map((item) => ({ ...item })),
    })),
    footerBlock: deriveFooterBlockFromMeta(meta),
  };
}

export function parseMenuPayload(value: unknown): MenuPayload | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;

  if (!row.meta || !Array.isArray(row.sections)) return null;

  const sections = row.sections
    .map(normalizeMenuSection)
    .filter((section): section is MenuSection => !!section);
  if (sections.length === 0) return null;
  const meta = normalizeMenuMeta(row.meta);
  const footerDefaults = deriveFooterBlockFromMeta(meta);

  return {
    meta,
    sections,
    footerBlock: normalizeFooterBlock(row.footerBlock, footerDefaults),
  };
}

export function resolveMenuPdfPath(value: unknown) {
  if (!value || typeof value !== "object") return "/fozzies-menu.pdf";
  const setting = value as Record<string, unknown>;
  return typeof setting.path === "string" && setting.path.trim() ? setting.path : "/fozzies-menu.pdf";
}
