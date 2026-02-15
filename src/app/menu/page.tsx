import MenuRender from "@/components/menu/MenuRender";
import { getSettingValue } from "@/lib/settings";
import { getDefaultMenuPayload, parseMenuPayload, resolveMenuPdfPath } from "@/lib/menuSettings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const defaults = getDefaultMenuPayload();
  let menuMeta = defaults.meta;
  let menuSections = defaults.sections;
  let menuPdfPath = "/fozzies-menu.pdf";

  const [storedMenu, storedPdf] = await Promise.all([
    getSettingValue<unknown>("menu_html"),
    getSettingValue<unknown>("menu_pdf"),
  ]);

  if (storedMenu == null) {
    menuMeta = defaults.meta;
    menuSections = defaults.sections;
  } else {
    const parsed = parseMenuPayload(storedMenu);
    if (parsed) {
      menuMeta = parsed.meta;
      menuSections = parsed.sections;
    } else {
      console.error("Invalid site_settings.menu_html payload. Falling back to static menuData.");
    }
  }
  menuPdfPath = resolveMenuPdfPath(storedPdf);

  return <MenuRender menuMeta={menuMeta} menuSections={menuSections} pdfUrl={menuPdfPath} />;
}
