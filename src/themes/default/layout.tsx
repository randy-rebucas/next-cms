import type { ReactNode } from "react";
import connectDB from "@/lib/mongoose";
import { Menu } from "@/models/Menu";
import { Setting } from "@/models/Setting";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import type { SiteTheme } from "@/core/themes";
import type { NavItem } from "./components/Navbar";
import type { SiteData } from "@/models/content";

interface Props {
  children: ReactNode;
  theme: SiteTheme;
}

async function fetchNavData(): Promise<{
  primaryItems: NavItem[];
  footerItems: NavItem[];
  siteName: string;
  logoUrl: string;
  site: Partial<SiteData>;
}> {
  try {
    await connectDB();

    const [primaryMenu, footerMenu, settings] = await Promise.all([
      Menu.findOne({ location: "primary" }).lean() as Promise<{ items?: NavItem[] } | null>,
      Menu.findOne({ location: "footer" }).lean() as Promise<{ items?: NavItem[] } | null>,
      Setting.find({ key: { $in: ["siteName", "logoUrl", "sitePhone", "siteEmail", "siteAddress"] } }).lean() as Promise<{ key: string; value: string }[]>,
    ]);

    const s: Record<string, string> = {};
    for (const row of settings) s[row.key] = row.value;

    const primaryItems = (primaryMenu?.items ?? [])
      .slice()
      .sort((a: NavItem & { order?: number }, b: NavItem & { order?: number }) => (a.order ?? 0) - (b.order ?? 0));

    const footerItems = (footerMenu?.items ?? [])
      .slice()
      .sort((a: NavItem & { order?: number }, b: NavItem & { order?: number }) => (a.order ?? 0) - (b.order ?? 0));

    return {
      primaryItems,
      footerItems,
      siteName: s.siteName ?? "",
      logoUrl:  s.logoUrl  ?? "",
      site: {
        name:     s.siteName    ?? undefined,
        phone:    s.sitePhone   ?? undefined,
        email:    s.siteEmail   ?? undefined,
        mapAddress: s.siteAddress ?? undefined,
      },
    };
  } catch {
    return { primaryItems: [], footerItems: [], siteName: "", logoUrl: "", site: {} };
  }
}

/**
 * Default theme layout — wraps post, page, and archive templates.
 * Fetches primary + footer menus from DB (WordPress: wp_nav_menu).
 */
export default async function DefaultLayout({ children, theme: _theme }: Props) {
  const { primaryItems, footerItems, siteName, logoUrl, site } = await fetchNavData();

  return (
    <div className="min-h-screen bg-[var(--background)] text-white flex flex-col">
      <Navbar items={primaryItems} siteName={siteName || undefined} logoUrl={logoUrl || undefined} />
      <div className="flex-1">{children}</div>
      <Footer site={site as SiteData} footerItems={footerItems} />
    </div>
  );
}
