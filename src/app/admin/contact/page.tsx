import { revalidatePath } from "next/cache";
import ContactEditor from "@/components/admin/ContactEditor";
import { getDefaultContactPayload, parseContactPayload, type ContactPayload } from "@/lib/contactSettings";
import { getSettingValue, upsertSettingValue } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminContactPage() {
  async function saveAction(payload: ContactPayload) {
    "use server";
    try {
      const { error } = await upsertSettingValue("contact_page", payload);
      if (error) return { ok: false, error: error.message };
      revalidatePath("/contact");
      revalidatePath("/admin/contact");
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Failed to save Contact page" };
    }
  }

  const defaults = getDefaultContactPayload();
  let initialValue: ContactPayload = defaults;
  const storedContact = await getSettingValue<unknown>("contact_page");

  if (storedContact) {
    const parsed = parseContactPayload(storedContact);
    if (parsed) {
      initialValue = parsed;
    } else {
      console.error("Invalid site_settings.contact_page payload in admin. Falling back to default Contact content.");
    }
  } else {
    try {
      await upsertSettingValue("contact_page", initialValue);
    } catch {
      // Keep editor functional if DB is unavailable.
    }
  }

  return (
    <main>
      <div>
        <div className="text-[11px] tracking-[0.18em] text-softgray">ADMIN</div>
        <h2 className="mt-2 font-serif text-4xl text-charcoal">Contact Editor</h2>
        <p className="mt-2 text-sm text-softgray">Edit Contact page content persisted in site settings.</p>
      </div>

      <div className="mt-8">
        <ContactEditor initialValue={initialValue} saveAction={saveAction} />
      </div>
    </main>
  );
}

