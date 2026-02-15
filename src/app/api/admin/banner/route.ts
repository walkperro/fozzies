import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { upsertSettingValue } from "@/lib/settings";
import { normalizeBannerSettings } from "@/lib/banner";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const banner = normalizeBannerSettings(payload);

  const { error } = await upsertSettingValue("site_banner", {
    ...banner,
    updatedAt: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  revalidatePath("/");
  revalidatePath("/admin/banner");

  return NextResponse.json({ ok: true, banner });
}
