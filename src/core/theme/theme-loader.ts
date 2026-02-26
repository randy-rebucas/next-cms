/**
 * core/theme/theme-loader.ts
 *
 * Async template / layout loaders — the public API consumed by Next.js pages.
 * WordPress equivalent: the functions that actually load (require) template files
 * after the template hierarchy has been resolved.
 *
 * Each loader calls resolveEntry(theme) to get the correct import function,
 * dynamically imports the module, and returns the default export (React component).
 */
import connectDB from "@/lib/mongoose";
import { Setting } from "@/models/Setting";
import type { SiteTheme } from "@/core/themes";
import type { PostTemplateProps } from "@/themes/default/templates/post";
import type { PageTemplateProps } from "@/themes/default/templates/page";
import type { ArchiveTemplateProps } from "@/themes/default/templates/archive";
import type { CategoryTemplateProps } from "@/themes/default/templates/category";
import type { SearchTemplateProps } from "@/themes/default/templates/search";
import type { NotFoundTemplateProps } from "@/themes/default/templates/404";
import type React from "react";
import { validateTheme } from "./theme-registry";
import { resolveEntry } from "./fallback";
import { logThemeWarn } from "./theme-logger";
import type { ThemeName } from "./theme-registry";

// ── Module shape types ────────────────────────────────────────────────────────

type LayoutModule   = { default: React.ComponentType<{ children: React.ReactNode; theme: SiteTheme }> };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HomeModule     = { default: React.ComponentType<any> };
type PostModule     = { default: React.ComponentType<PostTemplateProps> };
type PageModule     = { default: React.ComponentType<PageTemplateProps> };
type CategoryModule = { default: React.ComponentType<CategoryTemplateProps> };
type ArchiveModule  = { default: React.ComponentType<ArchiveTemplateProps> };
type SearchModule   = { default: React.ComponentType<SearchTemplateProps> };
type NotFoundModule = { default: React.ComponentType<NotFoundTemplateProps> };
type AssetsModule   = { themeStyles: string };

// ── Active theme resolution ───────────────────────────────────────────────────

/**
 * Read the active theme name from the database.
 * Falls back to "default" if unset, unknown, or the DB is unavailable.
 */
export async function getActiveTheme(): Promise<ThemeName> {
  try {
    await connectDB();
    const row = await Setting.findOne({ key: "activeTheme" }).lean() as { value?: string } | null;
    const raw  = row?.value?.trim() ?? "default";
    const name = validateTheme(raw);
    if (name !== raw) {
      logThemeWarn(`Unknown theme "${raw}", falling back to "default"`, { operation: "getActiveTheme" });
    }
    return name;
  } catch {
    return "default";
  }
}

// ── Layout loader ─────────────────────────────────────────────────────────────

/** Load the theme layout component (Navbar + Footer shell). */
export async function loadLayout(theme: ThemeName): Promise<LayoutModule["default"]> {
  const mod = await resolveEntry(theme).layout() as LayoutModule;
  return mod.default;
}

// ── Template loaders ──────────────────────────────────────────────────────────

/** front-page.php equivalent */
export async function loadHomeTemplate(theme: ThemeName): Promise<HomeModule["default"]> {
  const mod = await resolveEntry(theme).home() as HomeModule;
  return mod.default;
}

/** single.php equivalent */
export async function loadPostTemplate(theme: ThemeName): Promise<PostModule["default"]> {
  const mod = await resolveEntry(theme).post() as PostModule;
  return mod.default;
}

/** page.php equivalent */
export async function loadPageTemplate(theme: ThemeName): Promise<PageModule["default"]> {
  const mod = await resolveEntry(theme).page() as PageModule;
  return mod.default;
}

/** category.php equivalent */
export async function loadCategoryTemplate(theme: ThemeName): Promise<CategoryModule["default"]> {
  const mod = await resolveEntry(theme).category() as CategoryModule;
  return mod.default;
}

/** archive.php equivalent (tag + blog-index) */
export async function loadArchiveTemplate(theme: ThemeName): Promise<ArchiveModule["default"]> {
  const mod = await resolveEntry(theme).archive() as ArchiveModule;
  return mod.default;
}

/** search.php equivalent */
export async function loadSearchTemplate(theme: ThemeName): Promise<SearchModule["default"]> {
  const mod = await resolveEntry(theme).search() as SearchModule;
  return mod.default;
}

/** 404.php equivalent */
export async function load404Template(theme: ThemeName): Promise<NotFoundModule["default"]> {
  const mod = await resolveEntry(theme)["404"]() as NotFoundModule;
  return mod.default;
}

// ── Asset loader ──────────────────────────────────────────────────────────────

/**
 * Load the theme's static CSS string (assets/index.ts → themeStyles).
 * Injected into <head> alongside buildThemeCss() color variables.
 * Returns "" on failure so the app never crashes on a missing assets file.
 */
export async function loadThemeStyles(theme: ThemeName): Promise<string> {
  try {
    const mod = await resolveEntry(theme).assets() as AssetsModule;
    return mod.themeStyles ?? "";
  } catch (err) {
    logThemeWarn("assets/index.ts not found or export missing", { theme: String(theme), operation: "loadThemeStyles" });
    void err;
    return "";
  }
}
