import MenuRender from "@/components/menu/MenuRender";
import { getSettingValue } from "@/lib/settings";
import { getDefaultMenuPayload, parseMenuPayload, resolveMenuPdfPath } from "@/lib/menuSettings";
import type { Metadata } from "next";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Menu",
  description: "View the latest Fozzie's Dining menu, including seasonal chef selections and downloadable PDF menu.",
  alternates: {
    canonical: "/menu",
  },
  openGraph: {
    title: "Menu | Fozzie's Dining",
    description: "View the latest Fozzie's Dining menu, including seasonal chef selections and downloadable PDF menu.",
    url: "/menu",
    images: [
      {
        url: "/brand/logo_all_1_hq.png",
        alt: "Fozzie's Dining logo",
      },
    ],
  },
  twitter: {
    title: "Menu | Fozzie's Dining",
    description: "View the latest Fozzie's Dining menu, including seasonal chef selections and downloadable PDF menu.",
    images: ["/brand/logo_all_1_hq.png"],
  },
};

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
