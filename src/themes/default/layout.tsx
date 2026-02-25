import type { ReactNode } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import type { SiteTheme } from "@/core/themes";

interface Props {
  children: ReactNode;
  /** Injected by the theme loader. CSS vars are already set in <head> by
   *  the root layout; this prop is available for any inline-style overrides. */
  theme: SiteTheme;
}

/**
 * Default theme shell.
 * Wraps every public page with the site Navbar and Footer.
 * Add global page chrome here (banners, breadcrumbs, skip-links, etc.).
 */
export default function DefaultLayout({ children, theme: _theme }: Props) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-white flex flex-col">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
