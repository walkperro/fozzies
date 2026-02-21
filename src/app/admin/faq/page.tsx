import { revalidatePath } from "next/cache";
import FaqEditor from "@/components/admin/FaqEditor";
import { getDefaultFaqPayload, parseFaqPayload, type FaqPayload } from "@/lib/faqSettings";
import { getSettingValue, upsertSettingValue } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminFaqPage() {
  async function saveAction(payload: FaqPayload) {
    "use server";
    try {
      const { error } = await upsertSettingValue("faq_page", payload);
      if (error) return { ok: false, error: error.message };
      revalidatePath("/faq");
      revalidatePath("/admin/faq");
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Failed to save FAQ page" };
    }
  }

  const defaults = getDefaultFaqPayload();
  let initialValue: FaqPayload = defaults;
  const storedFaq = await getSettingValue<unknown>("faq_page");

  if (storedFaq) {
    const parsed = parseFaqPayload(storedFaq);
    if (parsed) {
      initialValue = parsed;
    } else {
      console.error("Invalid site_settings.faq_page payload in admin. Falling back to default FAQ content.");
    }
  } else {
    try {
      await upsertSettingValue("faq_page", initialValue);
    } catch {
      // Keep editor functional if DB is unavailable.
    }
  }

  return (
    <main>
      <div>
        <div className="text-[11px] tracking-[0.18em] text-softgray">ADMIN</div>
        <h2 className="mt-2 font-serif text-4xl text-charcoal">FAQ Editor</h2>
        <p className="mt-2 text-sm text-softgray">Edit FAQ content persisted in site settings.</p>
      </div>

      <div className="mt-8">
        <FaqEditor initialValue={initialValue} saveAction={saveAction} />
      </div>
    </main>
  );
}

