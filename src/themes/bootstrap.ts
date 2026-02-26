/**
 * themes/bootstrap.ts
 *
 * Theme registration — imported once at app startup (src/app/layout.tsx).
 * WordPress equivalent: functions.php being loaded for every theme.
 *
 * Each theme beyond "default" is registered here as a child theme.
 * Child themes declare only the templates they override; all others
 * fall back to the parent ("default") theme automatically.
 *
 * To add a new theme:
 *   1. Create src/themes/<name>/ with layout.tsx (required) and any overrides.
 *   2. Add a registerChildTheme() call below.
 *   3. The admin Theme page will automatically detect it via config.json.
 */
import { registerChildTheme } from "@/core/theme";

// ── Minimal theme ─────────────────────────────────────────────────────────────
// Light, editorial child theme. Overrides layout, home, and assets.
// All other templates (post, page, archive, category, search, 404) → Default.

registerChildTheme("minimal", {
  layout: () => import("@/themes/minimal/layout"),
  assets: () => import("@/themes/minimal/assets"),
  home:   () => import("@/themes/minimal/templates/home"),
});

// ── Add more themes below as needed ──────────────────────────────────────────
// registerChildTheme("corporate", {
//   layout: () => import("@/themes/corporate/layout"),
//   home:   () => import("@/themes/corporate/templates/home"),
// });
