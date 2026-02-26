/**
 * core/themes/loader.ts
 *
 * @deprecated  Import from "@/core/theme" instead.
 *
 * Backward-compatibility shim — re-exports everything from the new
 * split module at src/core/theme/. Existing imports continue to work
 * without modification while new code uses the canonical path.
 *
 * New structure:
 *   core/theme/theme-registry.ts    — REGISTRY, registerChildTheme, types
 *   core/theme/template-resolver.ts — resolveTemplate()
 *   core/theme/fallback.ts          — resolveEntry()
 *   core/theme/theme-loader.ts      — getActiveTheme(), load*Template()
 *   core/theme/index.ts             — barrel re-export of all of the above
 */
export * from "@/core/theme";
