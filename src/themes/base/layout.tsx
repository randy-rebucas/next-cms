/**
 * Base starter theme — layout.tsx
 *
 * REQUIRED: Every theme must provide this file.
 * WordPress equivalent: header.php + footer.php
 *
 * This is the shell that wraps all content templates (post, page, archive, etc.).
 * Replace the TODO sections with your Navbar and Footer components.
 *
 * Steps to build your theme:
 *   1. Copy src/themes/base/ → src/themes/<your-name>/
 *   2. Implement layout.tsx (this file) with your Navbar + Footer
 *   3. Optionally add templates/ overrides (post.tsx, page.tsx, home.tsx, etc.)
 *   4. Optionally add assets/index.ts with `export const themeStyles = "..."`
 *   5. Register in src/themes/bootstrap.ts:
 *        registerChildTheme("your-name", {
 *          layout: () => import("@/themes/your-name/layout"),
 *        });
 *   6. Add config.json entry and add to src/themes/index.ts REGISTERED_THEMES
 */
import type { ReactNode } from "react";
import type { SiteTheme } from "@/core/themes";

interface Props {
  children: ReactNode;
  theme:    SiteTheme;
}

export default async function BaseLayout({ children, theme: _theme }: Props) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* TODO: Replace with your Navbar component */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6">
        <span className="font-bold text-slate-900">My Theme</span>
      </header>

      <div className="flex-1">{children}</div>

      {/* TODO: Replace with your Footer component */}
      <footer className="bg-slate-50 border-t border-slate-200 py-8 px-6 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} My Theme
      </footer>
    </div>
  );
}
