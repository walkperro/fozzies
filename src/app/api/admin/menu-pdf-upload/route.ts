import { writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { upsertSettingValue } from "@/lib/settings";

export const runtime = "nodejs";

type MenuPdfSetting = {
  path: string;
  updatedAt: string;
};

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Missing file" }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ ok: false, error: "Only PDF files are allowed" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const storagePath = "menus/fozzies-menu.pdf";

  try {
    const supabase = supabaseAdmin();
    const { error: uploadError } = await supabase.storage.from("public-assets").upload(storagePath, file, {
      upsert: true,
      contentType: "application/pdf",
    });

    if (!uploadError) {
      const { data } = supabase.storage.from("public-assets").getPublicUrl(storagePath);
      const setting: MenuPdfSetting = { path: data.publicUrl, updatedAt: now };
      await upsertSettingValue("menu_pdf", setting);
      return NextResponse.json({ ok: true, path: setting.path, provider: "supabase-storage" });
    }
  } catch (err) {
    console.error("Menu PDF storage upload failed:", err);
  }

  try {
    const bytes = await file.arrayBuffer();
    const outputPath = path.join(process.cwd(), "public", "fozzies-menu.pdf");
    await writeFile(outputPath, Buffer.from(bytes));

    const setting: MenuPdfSetting = { path: "/fozzies-menu.pdf", updatedAt: now };
    await upsertSettingValue("menu_pdf", setting);
    return NextResponse.json({
      ok: true,
      path: setting.path,
      provider: "local-public-fallback",
      note: "TODO: local filesystem fallback may not work on serverless platforms like Vercel.",
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: "Upload failed: configure Supabase Storage bucket public-assets/menus or durable file storage.",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
