/**
 * Base starter theme — assets/index.ts
 * WordPress equivalent: style.css (additional rules beyond what Tailwind provides)
 *
 * Export a `themeStyles` string containing any CSS you want injected into <head>
 * alongside the dynamic theme-color variables produced by buildThemeCss().
 *
 * CSS custom properties (--gold, --gold-rgb, --accent-line, etc.) are set by
 * buildThemeCss() from the admin Theme settings, so you can reference them here
 * and they will automatically update when the admin changes theme colors.
 *
 * Steps:
 *   1. Replace the placeholder comment below with your theme's CSS.
 *   2. Register this file in themes/bootstrap.ts:
 *        registerChildTheme("your-name", {
 *          layout: () => import("@/themes/your-name/layout"),
 *          assets: () => import("@/themes/your-name/assets"),
 *        });
 */

export const themeStyles = `
/* ── TODO: Add your theme's custom CSS here ─────────────────────────────── */
/* Reference CSS variables set by buildThemeCss() for colors, e.g.:
   color: var(--gold);
   border-color: var(--accent-line, var(--gold));
*/
`.trim();
