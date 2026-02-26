/**
 * core/theme/theme-registry.ts
 *
 * Static theme registry and child-theme registration.
 * WordPress equivalent: the active theme's functions.php being loaded +
 * the theme switcher in wp-admin knowing which themes exist.
 *
 * REGISTRY maps theme name → { layout, assets, templates... }.
 * Child themes call registerChildTheme() with only the slots they override;
 * all other slots fall back to the "default" parent theme.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ImportFn = () => Promise<any>;

/** Full theme entry — every slot is an async module importer. */
export type ThemeEntry = {
  layout:   ImportFn;
  assets:   ImportFn;   // resolves { themeStyles: string }
  home:     ImportFn;
  post:     ImportFn;
  page:     ImportFn;
  category: ImportFn;
  archive:  ImportFn;
  search:   ImportFn;
  "404":    ImportFn;
};

/** Child themes only need to supply the slots they override. */
export type ChildThemeEntry = Partial<ThemeEntry> & { layout: ImportFn };

/** Compile-time theme names (runtime child themes use `string`). */
export type ThemeName = keyof typeof BASE_REGISTRY | string;

/** Every template type this system supports. */
export type TemplateType =
  | "home"
  | "post"
  | "page"
  | "category"
  | "archive"
  | "search"
  | "404";

// ── Base registry (built-in themes only) ─────────────────────────────────────

export const BASE_REGISTRY = {
  default: {
    layout:   () => import("@/themes/default/layout"),
    assets:   () => import("@/themes/default/assets"),
    home:     () => import("@/themes/default/templates/home"),
    post:     () => import("@/themes/default/templates/post"),
    page:     () => import("@/themes/default/templates/page"),
    category: () => import("@/themes/default/templates/category"),
    archive:  () => import("@/themes/default/templates/archive"),
    search:   () => import("@/themes/default/templates/search"),
    "404":    () => import("@/themes/default/templates/404"),
  } satisfies ThemeEntry,
} as const;

// ── Mutable runtime registry ─────────────────────────────────────────────────
// Starts as a copy of BASE_REGISTRY. Child themes push entries at startup.

export const REGISTRY: Record<string, ThemeEntry> = { ...BASE_REGISTRY };

// ── Child theme registration ──────────────────────────────────────────────────

/**
 * Register a child (or fully custom) theme.
 * Any slots not supplied inherit from the "default" parent automatically.
 *
 * Call this from src/themes/bootstrap.ts — it is imported once by the
 * root layout before any request is served.
 *
 * @example
 *   registerChildTheme("minimal", {
 *     layout: () => import("@/themes/minimal/layout"),
 *     home:   () => import("@/themes/minimal/templates/home"),
 *     // post, page, archive, category, search, 404 → inherit from default
 *   });
 */
export function registerChildTheme(name: string, entry: ChildThemeEntry): void {
  REGISTRY[name] = { ...BASE_REGISTRY.default, ...entry };
}

// ── Security helpers ──────────────────────────────────────────────────────────

/**
 * Return every registered theme name (built-in + child themes).
 * Use this to populate admin theme switchers without hardcoding names.
 */
export function getAllowedThemes(): string[] {
  return Object.keys(REGISTRY);
}

/**
 * Validate a theme name against the live registry.
 * Returns the name unchanged if registered, "default" otherwise.
 *
 * Prevents arbitrary file-system access from an unregistered theme name
 * stored in the database. Always call this before using a theme name as
 * a key into REGISTRY or passing it to a loader.
 */
export function validateTheme(theme: string): ThemeName {
  return theme in REGISTRY ? theme : "default";
}
