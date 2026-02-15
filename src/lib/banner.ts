export type SiteBannerMode = "static" | "marquee";

export type SiteBannerSettings = {
  enabled: boolean;
  text: string;
  mode: SiteBannerMode;
  speed: number;
};

export const DEFAULT_BANNER_SETTINGS: SiteBannerSettings = {
  enabled: false,
  text: "",
  mode: "static",
  speed: 40,
};

export function normalizeBannerSettings(value: unknown): SiteBannerSettings {
  if (!value || typeof value !== "object") return { ...DEFAULT_BANNER_SETTINGS };
  const row = value as Record<string, unknown>;
  const rawSpeed = Number(
    Object.prototype.hasOwnProperty.call(row, "speedSeconds") ? row.speedSeconds : row.speed
  );

  return {
    enabled: Boolean(row.enabled),
    text: typeof row.text === "string" ? row.text.trim() : "",
    mode: row.mode === "marquee" ? "marquee" : "static",
    speed: Number.isFinite(rawSpeed) ? Math.min(Math.max(rawSpeed, 20), 120) : DEFAULT_BANNER_SETTINGS.speed,
  };
}
