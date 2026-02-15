import MenuPdfUploadForm from "@/components/admin/MenuPdfUploadForm";
import { getSettingValue } from "@/lib/settings";
import { resolveMenuPdfPath } from "@/lib/menuSettings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MenuPdfSetting = {
  path?: string;
  updatedAt?: string;
};

export default async function AdminMenuPdfPage() {
  const value = await getSettingValue<MenuPdfSetting>("menu_pdf");
  const currentPath = resolveMenuPdfPath(value);

  return (
    <main>
      <div>
        <div className="text-[11px] tracking-[0.18em] text-softgray">ADMIN</div>
        <h2 className="mt-2 font-serif text-4xl text-charcoal">Menu PDF</h2>
        <p className="mt-2 text-sm text-softgray">Upload or replace the public PDF menu asset.</p>
      </div>

      <section className="mt-8 border border-charcoal/10 bg-ivory p-5">
        <h3 className="font-serif text-2xl text-charcoal">Current PDF</h3>
        <div className="mt-2 text-sm text-softgray">
          <div>Path: {currentPath}</div>
          <div>Updated: {value?.updatedAt ? new Date(value.updatedAt).toLocaleString() : "Unknown"}</div>
        </div>
        <div className="mt-3">
          <a
            href={currentPath}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-gold px-4 py-2 text-sm font-medium text-charcoal transition hover:bg-gold/15"
          >
            Open Current PDF
          </a>
        </div>

        <MenuPdfUploadForm />

        <div className="mt-4 text-xs text-softgray">Storage bucket required: create `public-assets` in Supabase Storage and set it public.</div>
      </section>
    </main>
  );
}
