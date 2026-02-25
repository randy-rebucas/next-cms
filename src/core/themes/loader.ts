/**
 * core/themes/loader.ts
 *
 * Theme loader — resolves the active theme name and dynamically imports
 * the correct layout / template for a given content type.
 */
import connectDB from "@/lib/mongoose";
import { Setting } from "@/models/Setting";
import type { SiteTheme } from "@/core/themes";
import type { PostTemplateProps } from "@/themes/default/templates/post";
import type { PageTemplateProps } from "@/themes/default/templates/page";
import type { ArchiveTemplateProps } from "@/themes/default/templates/archive";

// ── Known theme names ────────────────────────────────────────────────────────

export type ThemeName = keyof typeof REGISTRY;
export type TemplateType = "post" | "page" | "archive";

// ── Static registry ──────────────────────────────────────────────────────────

const REGISTRY = {
  default: {
    layout:  () => import("@/themes/default/layout"),
    post:    () => import("@/themes/default/templates/post"),
    page:    () => import("@/themes/default/templates/page"),
    archive: () => import("@/themes/default/templates/archive"),
  },
} as const;

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Read the active theme name from settings.
 * Falls back to "default" if unset or unknown.
 */
export async function getActiveTheme(): Promise<ThemeName> {
  try {
    await connectDB();
    const row = await Setting.findOne({ key: "activeTheme" }).lean() as { value?: string } | null;
    const name = row?.value?.trim() ?? "default";
    return (name in REGISTRY ? name : "default") as ThemeName;
  } catch {
    return "default";
  }
}

// ── Layout loader ────────────────────────────────────────────────────────────

type LayoutModule = { default: React.ComponentType<{ children: React.ReactNode; theme: SiteTheme }> };

export async function loadLayout(theme: ThemeName): Promise<LayoutModule["default"]> {
  const entry = REGISTRY[theme] ?? REGISTRY.default;
  const mod = await entry.layout() as LayoutModule;
  return mod.default;
}

// ── Template loaders ─────────────────────────────────────────────────────────

type PostModule    = { default: React.ComponentType<PostTemplateProps> };
type PageModule    = { default: React.ComponentType<PageTemplateProps> };
type ArchiveModule = { default: React.ComponentType<ArchiveTemplateProps> };

export async function loadPostTemplate(theme: ThemeName): Promise<PostModule["default"]> {
  const entry = REGISTRY[theme] ?? REGISTRY.default;
  const mod = await entry.post() as PostModule;
  return mod.default;
}

export async function loadPageTemplate(theme: ThemeName): Promise<PageModule["default"]> {
  const entry = REGISTRY[theme] ?? REGISTRY.default;
  const mod = await entry.page() as PageModule;
  return mod.default;
}

export async function loadArchiveTemplate(theme: ThemeName): Promise<ArchiveModule["default"]> {
  const entry = REGISTRY[theme] ?? REGISTRY.default;
  const mod = await entry.archive() as ArchiveModule;
  return mod.default;
}
