/**
 * core/theme/index.ts
 *
 * Barrel export — single import point for all theme-system utilities.
 *
 * Usage:
 *   import { getActiveTheme, loadLayout, resolveTemplate } from "@/core/theme";
 *
 * Internal modules (not for direct consumption by app pages):
 *   ./theme-registry   — REGISTRY, registerChildTheme, types
 *   ./template-resolver— resolveTemplate()
 *   ./fallback         — resolveEntry()
 *   ./theme-loader     — all async load*() functions
 */

// Types
export type { ThemeName, TemplateType, ThemeEntry, ChildThemeEntry, ImportFn } from "./theme-registry";

// Registry API
export { REGISTRY, BASE_REGISTRY, registerChildTheme, validateTheme, getAllowedThemes } from "./theme-registry";

// Theme logger
export type { ThemeLogContext } from "./theme-logger";
export { logThemeError, logThemeWarn } from "./theme-logger";

// Template resolver (WordPress hierarchy mapper)
export { resolveTemplate } from "./template-resolver";

// Fallback / inheritance resolver
export { resolveEntry } from "./fallback";

// Async loaders (consumed by Next.js pages)
export {
  getActiveTheme,
  loadLayout,
  loadHomeTemplate,
  loadPostTemplate,
  loadPageTemplate,
  loadCategoryTemplate,
  loadArchiveTemplate,
  loadSearchTemplate,
  load404Template,
  loadThemeStyles,
} from "./theme-loader";
