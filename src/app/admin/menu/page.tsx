import { revalidatePath } from "next/cache";
import MenuEditor from "@/components/admin/MenuEditor";
import { getSettingValue, upsertSettingValue } from "@/lib/settings";
import { getDefaultMenuPayload, parseMenuPayload, resolveMenuPdfPath, type MenuPayload } from "@/lib/menuSettings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  async function saveAction(payload: MenuPayload) {
    "use server";
    try {
      const { error } = await upsertSettingValue("menu_html", payload);
      if (error) return { ok: false, error: error.message };
      revalidatePath("/menu");
      revalidatePath("/admin/menu");
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Failed to save menu" };
    }
  }

  const defaults = getDefaultMenuPayload();
  let initialValue: MenuPayload = defaults;
  const [storedMenu, storedPdf] = await Promise.all([getSettingValue<unknown>("menu_html"), getSettingValue<unknown>("menu_pdf")]);

  if (storedMenu) {
    const parsed = parseMenuPayload(storedMenu);
    if (parsed) {
      initialValue = parsed;
    } else {
      console.error("Invalid site_settings.menu_html payload in admin. Falling back to static menuData.");
    }
  } else {
    try {
      await upsertSettingValue("menu_html", initialValue);
    } catch {
      // Keep editor functional even if DB is not ready.
    }
  }

  const currentPdfPath = resolveMenuPdfPath(storedPdf);

  return (
    <main>
      <div>
        <div className="text-[11px] tracking-[0.18em] text-softgray">ADMIN</div>
        <h2 className="mt-2 font-serif text-4xl text-charcoal">Menu Editor</h2>
        <p className="mt-2 text-sm text-softgray">Edit menu metadata, sections, and item details.</p>
      </div>

      <div className="mt-8">
        <MenuEditor initialValue={initialValue} currentPdfPath={currentPdfPath} saveAction={saveAction} />
      </div>
    </main>
  );
}
