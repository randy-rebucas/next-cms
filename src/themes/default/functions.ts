/**
 * Default theme — functions.ts
 * WordPress functions.php equivalent.
 *
 * Declares theme capabilities, registered menu locations, and sidebar/widget areas.
 * Imported by theme components and the theme system to advertise capabilities.
 */

export const THEME_ID = "default";
export const THEME_VERSION = "1.0.0";

// ── Nav Menus ─────────────────────────────────────────────────────────────────
// WordPress: register_nav_menus()

export const NAV_MENUS: Record<string, string> = {
  primary: "Primary Navigation",
  footer:  "Footer Links",
  mobile:  "Mobile Menu",
};

// ── Theme Supports ────────────────────────────────────────────────────────────
// WordPress: add_theme_support()

export const THEME_SUPPORTS = [
  "menus",
  "custom-logo",
  "custom-colors",
  "post-thumbnails",
  "editor-styles",
  "responsive-embeds",
  "comments",
] as const;

export type ThemeSupport = (typeof THEME_SUPPORTS)[number];

/** Returns true if this theme declares support for a given feature. */
export function hasThemeSupport(feature: string): boolean {
  return (THEME_SUPPORTS as readonly string[]).includes(feature);
}

// ── Widget / Sidebar Areas ────────────────────────────────────────────────────
// WordPress: register_sidebar()

export interface WidgetArea {
  id: string;
  name: string;
  description: string;
}

export const WIDGET_AREAS: WidgetArea[] = [
  {
    id:          "sidebar-1",
    name:        "Main Sidebar",
    description: "Appears alongside blog posts and archive pages.",
  },
  {
    id:          "sidebar-footer",
    name:        "Footer Widgets",
    description: "Appears in the footer widget column area.",
  },
];

// ── Image Sizes ───────────────────────────────────────────────────────────────
// WordPress: add_image_size()

export const IMAGE_SIZES = {
  thumbnail:  { width: 150,  height: 150,  crop: true  },
  medium:     { width: 300,  height: 300,  crop: false },
  large:      { width: 1024, height: 1024, crop: false },
  "post-thumbnail": { width: 820, height: 400, crop: true },
} as const;

// ── Default Excerpt Length ────────────────────────────────────────────────────
// WordPress: the_excerpt_length filter

export const EXCERPT_LENGTH = 55; // words
