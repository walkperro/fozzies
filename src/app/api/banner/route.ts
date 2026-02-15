import { NextResponse } from "next/server";
import { getSettingValue } from "@/lib/settings";
import { normalizeBannerSettings } from "@/lib/banner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const stored = await getSettingValue<unknown>("site_banner");
  const banner = normalizeBannerSettings(stored);

  return NextResponse.json(banner, {
    headers: { "cache-control": "no-store, max-age=0" },
  });
}
