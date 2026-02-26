/**
 * Minimal theme — config.ts
 * Light, editorial theme that extends the Default theme.
 * Only layout and home template are overridden; all others inherit from Default.
 */
export const themeConfig = {
  id: "minimal",
  name: "Minimal",
  version: "1.0.0",
  parent: "default",

  /** Features this child theme supports */
  supports: {
    menus:       true,
    customLogo:  true,
    customColors:true,
    comments:    true,
  },

  menus: ["primary", "footer"] as const,

  /** Only these templates are overridden; the rest inherit from Default */
  overrides: ["layout", "home", "assets"] as const,

  /** Layout variants supported */
  layouts: ["default", "fullwidth"] as const,

  /** Parent theme fallback (WordPress: Template: default) */
  fallback: "default" as const,
} as const;
