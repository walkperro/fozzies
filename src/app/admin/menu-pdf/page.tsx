import MenuPdfUploadForm from "@/components/admin/MenuPdfUploadForm";
import { getSettingValue } from "@/lib/settings";
import { resolveMenuPdfPath } from "@/lib/menuSettings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MenuPdfSetting = {
  path?: string;
  updatedAt?: string;
};

function getFilename(pathOrUrl: string) {
  if (!pathOrUrl) return "menu.pdf";
  try {
    const url = new URL(pathOrUrl);
    const name = url.pathname.split("/").pop();
    return name || "menu.pdf";
  } catch {
    const withoutQuery = pathOrUrl.split("?")[0]?.split("#")[0] || "";
    const name = withoutQuery.split("/").pop();
    return name || "menu.pdf";
  }
}

export default async function AdminMenuPdfPage() {
  const value = await getSettingValue<MenuPdfSetting>("menu_pdf");
  const currentPath = resolveMenuPdfPath(value);
  const filename = getFilename(currentPath);

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
          <div>File: {filename}</div>
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
      </section>
    </main>
  );
}
