import { revalidatePath } from "next/cache";
import MenuEditor from "@/components/admin/MenuEditor";
import { MENU_META, MENU_SECTIONS, type MenuMeta, type MenuSection } from "@/app/menu/menuData";
import { getSettingValue, upsertSettingValue } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StoredMenuPayload = {
  meta: MenuMeta;
  sections: MenuSection[];
};

function isMenuPayload(value: unknown): value is StoredMenuPayload {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (!v.meta || !v.sections) return false;
  return Array.isArray(v.sections);
}

export default async function AdminMenuPage() {
  async function saveAction(payload: StoredMenuPayload) {
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

  let initialValue: StoredMenuPayload = { meta: MENU_META, sections: MENU_SECTIONS };
  const stored = await getSettingValue<unknown>("menu_html");

  if (isMenuPayload(stored)) {
    initialValue = stored;
  } else if (!stored) {
    try {
      await upsertSettingValue("menu_html", initialValue);
    } catch {
      // TODO: create fozzies.site_settings via migration before relying on persisted menu content.
    }
  }

  return (
    <main>
      <div>
        <div className="text-[11px] tracking-[0.18em] text-softgray">ADMIN</div>
        <h2 className="mt-2 font-serif text-4xl text-charcoal">Menu Editor</h2>
        <p className="mt-2 text-sm text-softgray">Edit menu metadata, sections, and item details.</p>
      </div>

      <div className="mt-8">
        <MenuEditor initialValue={initialValue} saveAction={saveAction} />
      </div>
    </main>
  );
}
