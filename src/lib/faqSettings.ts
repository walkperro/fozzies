export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type FaqSection = {
  id: string;
  heading: string;
  items: FaqItem[];
};

export type FaqPayload = {
  title: string;
  subtitle?: string;
  sections: FaqSection[];
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

export function getDefaultFaqPayload(): FaqPayload {
  return {
    title: "FAQ",
    subtitle: "",
    sections: [
      {
        id: makeId("faq-section"),
        heading: "General",
        items: [
          {
            id: makeId("faq-item"),
            question: "Dress code",
            answer: "Smart casual. Jackets welcome but not required.",
          },
          {
            id: makeId("faq-item"),
            question: "Reservations",
            answer: "Reservations recommended, especially weekends and special occasions.",
          },
        ],
      },
    ],
  };
}

function normalizeFaqItem(value: unknown): FaqItem | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const question = toNonEmptyString(item.question);
  const answer = toNonEmptyString(item.answer);
  if (!question || !answer) return null;
  return {
    id: toNonEmptyString(item.id, makeId("faq-item")),
    question,
    answer,
  };
}

function normalizeFaqSection(value: unknown): FaqSection | null {
  if (!value || typeof value !== "object") return null;
  const section = value as Record<string, unknown>;
  const heading = toNonEmptyString(section.heading);
  if (!heading) return null;
  const items = Array.isArray(section.items)
    ? section.items.map(normalizeFaqItem).filter((item): item is FaqItem => !!item)
    : [];
  if (items.length === 0) return null;
  return {
    id: toNonEmptyString(section.id, makeId("faq-section")),
    heading,
    items,
  };
}

export function parseFaqPayload(value: unknown): FaqPayload | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (!Array.isArray(row.sections)) return null;
  const defaults = getDefaultFaqPayload();
  const sections = row.sections.map(normalizeFaqSection).filter((section): section is FaqSection => !!section);
  if (sections.length === 0) return null;
  return {
    title: toNonEmptyString(row.title, defaults.title),
    subtitle: toOptionalString(row.subtitle),
    sections,
  };
}

