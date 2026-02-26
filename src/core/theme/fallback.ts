/**
 * core/theme/fallback.ts
 *
 * Child-theme inheritance / fallback resolution.
 * WordPress equivalent: child theme falling back to parent theme templates.
 *
 * When a child theme only overrides a subset of templates, resolveEntry()
 * returns the merged entry (child slots merged over parent defaults) so
 * every slot is always defined. The merge happens at registerChildTheme()
 * time, so resolveEntry() itself is just a map lookup + null-safety guard.
 *
 * Fallback chain:
 *   requested theme → BASE_REGISTRY.default (if theme not found)
 */
import { REGISTRY, BASE_REGISTRY } from "./theme-registry";
import type { ThemeName, ThemeEntry } from "./theme-registry";

/**
 * Resolve the ThemeEntry for the given theme name.
 * Falls back to the "default" entry if the name is not registered.
 *
 * Per-template fallback is already baked in by registerChildTheme()
 * which merges child overrides over BASE_REGISTRY.default at registration time.
 */
export function resolveEntry(theme: ThemeName): ThemeEntry {
  return REGISTRY[theme] ?? REGISTRY.default ?? BASE_REGISTRY.default;
}
