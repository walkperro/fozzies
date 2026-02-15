import { getSettingValue } from "@/lib/settings";
import { normalizeBannerSettings } from "@/lib/banner";
import BannerSettingsForm from "@/components/admin/BannerSettingsForm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminBannerPage() {
  const stored = await getSettingValue<unknown>("site_banner");
  const banner = normalizeBannerSettings(stored);

  return (
    <main>
      <div>
        <div className="text-[11px] tracking-[0.18em] text-softgray">ADMIN</div>
        <h2 className="mt-2 font-serif text-4xl text-charcoal">Banner</h2>
        <p className="mt-2 text-sm text-softgray">Control the homepage message strip and motion style.</p>
      </div>

      <section className="mt-8 border border-charcoal/10 bg-ivory p-5">
        <h3 className="font-serif text-2xl text-charcoal">Homepage Banner</h3>
        <BannerSettingsForm initialValue={banner} />
      </section>
    </main>
  );
}
