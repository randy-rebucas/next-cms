/**
 * Minimal theme — layout.tsx
 * WordPress equivalent: header.php + footer.php
 *
 * Clean, light layout. White background, slate borders, no elaborate decorations.
 * Wraps all content templates (post, page, archive, category, search, 404).
 */
import type { ReactNode } from "react";
import connectDB from "@/lib/mongoose";
import { Menu } from "@/models/Menu";
import { Setting } from "@/models/Setting";
import MinimalNavbar from "./components/Navbar";
import MinimalFooter from "./components/Footer";
import type { SiteTheme } from "@/core/themes";
import type { NavItem } from "./components/Navbar";
import type { SiteData } from "@/models/content";

interface Props {
  children: ReactNode;
  theme:    SiteTheme;
}

async function fetchNavData() {
  try {
    await connectDB();
    const [primaryMenu, footerMenu, settings] = await Promise.all([
      Menu.findOne({ location: "primary" }).lean() as Promise<{ items?: NavItem[] } | null>,
      Menu.findOne({ location: "footer"  }).lean() as Promise<{ items?: NavItem[] } | null>,
      Setting.find({ key: { $in: ["siteName", "logoUrl", "sitePhone", "siteEmail"] } })
        .lean() as Promise<{ key: string; value: string }[]>,
    ]);

    const s: Record<string, string> = {};
    for (const row of settings) s[row.key] = row.value;

    const sort = (items: (NavItem & { order?: number })[]) =>
      items.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return {
      primaryItems: sort((primaryMenu?.items ?? []) as (NavItem & { order?: number })[]),
      footerItems:  sort((footerMenu?.items  ?? []) as (NavItem & { order?: number })[]),
      siteName: s.siteName ?? "",
      logoUrl:  s.logoUrl  ?? "",
      site: {
        name:  s.siteName ?? undefined,
        phone: s.sitePhone ?? undefined,
        email: s.siteEmail ?? undefined,
      } as Partial<SiteData>,
    };
  } catch {
    return { primaryItems: [], footerItems: [], siteName: "", logoUrl: "", site: {} };
  }
}

/**
 * Minimal theme layout — clean white background, top-nav, simple footer.
 * Content area has a light slate background for contrast with white cards.
 */
export default async function MinimalLayout({ children, theme: _theme }: Props) {
  const { primaryItems, footerItems, siteName, logoUrl, site } = await fetchNavData();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <MinimalNavbar
        items={primaryItems}
        siteName={siteName || undefined}
        logoUrl={logoUrl || undefined}
      />
      <div className="flex-1">{children}</div>
      <MinimalFooter site={site} footerItems={footerItems} />
    </div>
  );
}
