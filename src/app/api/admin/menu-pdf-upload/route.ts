import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { upsertSettingValue } from "@/lib/settings";
import { logServerEvent } from "@/lib/trackServer";

export const runtime = "nodejs";

type MenuPdfSetting = {
  path: string;
  updatedAt: string;
};

export async function POST(req: Request) {
  try {
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
    const supabase = supabaseAdmin();
    const { error: uploadError } = await supabase.storage.from("public-assets").upload(storagePath, file, {
      upsert: true,
      contentType: "application/pdf",
    });

    if (uploadError) {
      if (/bucket/i.test(uploadError.message) && /not found|does not exist/i.test(uploadError.message)) {
        return NextResponse.json(
          {
            ok: false,
            error: "Supabase Storage bucket `public-assets` is missing. Create it in Supabase Storage and make it public before uploading.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({ ok: false, error: `Upload failed: ${uploadError.message}` }, { status: 500 });
    }

    const { data } = supabase.storage.from("public-assets").getPublicUrl(storagePath);
    const setting: MenuPdfSetting = { path: data.publicUrl || storagePath, updatedAt: now };
    const { error: settingError } = await upsertSettingValue("menu_pdf", setting);
    if (settingError) {
      return NextResponse.json({ ok: false, error: `Failed to save setting: ${settingError.message}` }, { status: 500 });
    }

    await logServerEvent({
      event_type: "admin_pdf_upload",
      page_path: "/admin/menu-pdf",
      user_agent: req.headers.get("user-agent"),
      referrer: req.headers.get("referer"),
      meta: { file_name: file.name, storage_path: storagePath },
    });
    return NextResponse.json({
      ok: true,
      path: setting.path,
      updatedAt: setting.updatedAt,
      fileName: file.name,
      provider: "supabase-storage",
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: "Upload failed while writing menu PDF to Supabase Storage.",
        details: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
