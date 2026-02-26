/**
 * Default theme — assets/index.ts
 * WordPress equivalent: style.css (additional rules beyond what Tailwind provides)
 *
 * Exports a CSS string that is injected into <head> alongside the dynamic
 * theme-color CSS produced by buildThemeCss(). Theme-specific decorative
 * classes live here so they stay scoped to this theme and can be overridden
 * by child themes.
 */

/**
 * Static CSS for the default (law firm) theme.
 * References CSS custom properties set by buildThemeCss() so they
 * automatically update when the user changes theme colors in admin.
 */
export const themeStyles = `
/* ── Default theme: accent-line maps to --gold ──────────────────────────── */
:root {
  --accent-line: var(--gold);
}

/* ── Hero background pattern ─────────────────────────────────────────────── */
.theme-hero-pattern {
  background-image: radial-gradient(circle at 20% 80%, rgba(var(--gold-rgb, 180 134 11) / 0.08) 0%, transparent 60%),
                    radial-gradient(circle at 80% 20%, rgba(var(--gold-rgb, 180 134 11) / 0.05) 0%, transparent 60%);
}

/* ── Card hover ring — uses primary color ────────────────────────────────── */
.theme-card-hover:hover {
  box-shadow: 0 0 0 2px var(--gold);
}

/* ── Section divider ─────────────────────────────────────────────────────── */
.theme-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, var(--gold), transparent);
  opacity: 0.3;
}

/* ── Link accent ─────────────────────────────────────────────────────────── */
a.theme-link {
  color: var(--gold);
  transition: color 0.15s;
}
a.theme-link:hover {
  color: var(--gold-light, var(--gold));
}
`.trim();
