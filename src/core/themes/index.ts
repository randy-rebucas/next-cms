/** Persisted as `settings.siteTheme` (JSON) */
export interface SiteTheme {
  primaryColor: string;   // hex — drives --gold / --gold-light
  accentColor: string;    // hex — secondary accent
  bgDark: string;         // hex — deepest background (default slate-950)
  fontFamily: string;     // 'geist' | 'georgia' | 'system'
  borderRadius: string;   // 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  logoUrl: string;        // URL or empty
}

export const DEFAULT_THEME: SiteTheme = {
  primaryColor: "#b45309",   // amber-700
  accentColor: "#d97706",    // amber-600
  bgDark: "#020617",         // slate-950
  fontFamily: "geist",
  borderRadius: "lg",
  logoUrl: "",
};

export const FONT_OPTIONS = [
  { value: "geist",   label: "Geist (default)",      css: "var(--font-geist-sans), system-ui, sans-serif" },
  { value: "georgia", label: "Georgia (serif)",       css: "Georgia, 'Times New Roman', serif" },
  { value: "system",  label: "System UI (sans-serif)",css: "system-ui, -apple-system, sans-serif" },
  { value: "mono",    label: "Geist Mono (techy)",    css: "var(--font-geist-mono), monospace" },
];

export const RADIUS_OPTIONS = [
  { value: "none", label: "None",    css: "0px" },
  { value: "sm",   label: "Small",   css: "0.25rem" },
  { value: "md",   label: "Medium",  css: "0.5rem" },
  { value: "lg",   label: "Large",   css: "0.75rem" },
  { value: "xl",   label: "X-Large", css: "1rem" },
  { value: "full", label: "Pill",    css: "9999px" },
];

/** Generate the CSS custom-property block to inject into <head> */
export function buildThemeCss(t: SiteTheme): string {
  const font = FONT_OPTIONS.find((f) => f.value === t.fontFamily)?.css
    ?? FONT_OPTIONS[0].css;
  const radius = RADIUS_OPTIONS.find((r) => r.value === t.borderRadius)?.css
    ?? "0.75rem";

  // Lighten primary by ~15% for --gold-light — simple hex bump
  const accentCss = t.accentColor || t.primaryColor;

  return `
:root {
  --gold: ${t.primaryColor};
  --gold-light: ${accentCss};
  --background: ${t.bgDark};
  --bg-dark: ${t.bgDark};
  --font-body: ${font};
  --radius-base: ${radius};
}
body { font-family: var(--font-body); background: var(--background); }
::-webkit-scrollbar-thumb { background: var(--gold); }
.gold-underline::after, .gold-underline-left::after { background: var(--gold); }
`.trim();
}

/** Read and merge theme from a settings map */
export function resolveTheme(s: Record<string, unknown>): SiteTheme {
  const raw = s.siteTheme as Partial<SiteTheme> | undefined;
  return { ...DEFAULT_THEME, ...(raw ?? {}) };
}
