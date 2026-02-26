/**
 * Default theme — config.ts
 * WordPress functions.php equivalent (structured config variant).
 *
 * Exports a single `themeConfig` object with all theme capabilities.
 * Theme components import from here for feature-flag checks.
 * Detailed helpers (hasThemeSupport, etc.) remain in functions.ts.
 */
export const themeConfig = {
  id: "default",
  name: "Default Law Firm Theme",
  version: "1.0.0",
  author: "NextCMS",

  /** add_theme_support() equivalents */
  supports: {
    menus:           true,
    customLogo:      true,
    customColors:    true,
    postThumbnails:  true,
    editorStyles:    true,
    responsiveEmbeds:true,
    comments:        true,
  },

  /** register_nav_menus() — locations available for admin assignment */
  menus: ["primary", "footer", "mobile"] as const,

  /** register_sidebar() — widget areas */
  widgetAreas: ["sidebar-1", "sidebar-footer"] as const,

  /** add_image_size() */
  imageSizes: {
    thumbnail:       { width: 150,  height: 150,  crop: true  },
    medium:          { width: 300,  height: 300,  crop: false },
    large:           { width: 1024, height: 1024, crop: false },
    "post-thumbnail":{ width: 820,  height: 400,  crop: true  },
  },

  /** the_excerpt_length filter equivalent */
  excerptLength: 55, // words

  /** Template hierarchy — which content types this theme handles */
  templates: ["home", "post", "page", "category", "archive", "search", "404"] as const,

  /**
   * Layout variants this theme supports.
   * "default" = standard header+content+footer
   * "fullwidth" = no sidebar, content expands edge-to-edge
   */
  layouts: ["default", "fullwidth"] as const,

  /**
   * Parent theme to fall back to when a template is not found.
   * WordPress equivalent: "Template:" header in style.css
   */
  fallback: "base" as const,
} as const;

export type ThemeConfig = typeof themeConfig;
export type ThemeMenu = (typeof themeConfig.menus)[number];
export type ThemeTemplate = (typeof themeConfig.templates)[number];
