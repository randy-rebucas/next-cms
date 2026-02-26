/**
 * Base starter theme — config.ts
 *
 * WordPress equivalent: theme.json / functions.php feature declarations.
 *
 * Copy this file to your child theme and adjust the values.
 * The `id` must match the key used in registerChildTheme() (themes/bootstrap.ts)
 * and the directory name under src/themes/.
 */

export const themeConfig = {
  /** Must match the directory name and registerChildTheme() key. */
  id: "base",

  /** Human-readable theme name shown in the admin theme switcher. */
  name: "Base Starter Theme",

  version: "1.0.0",

  description: "Minimal starter scaffold. Copy to src/themes/<your-name>/ and implement.",

  /** If this is a child theme, set parent to the parent theme id. */
  parent: "default",

  /**
   * Which feature flags this theme supports.
   * WordPress equivalent: add_theme_support() calls in functions.php.
   */
  supports: {
    menus:            true,
    customLogo:       true,
    customColors:     true,
    postThumbnails:   true,
    editorStyles:     false,
    responsiveEmbeds: true,
    comments:         false,
  },

  /**
   * Menu location slugs this theme registers.
   * WordPress equivalent: register_nav_menus().
   */
  menus: ["primary", "footer"] as const,

  /**
   * Which templates this theme provides (beyond the parent's defaults).
   * Leave empty if all templates fall back to the parent theme.
   */
  templates: [] as string[],

  /** Layout variants this theme exposes to templates */
  layouts: ["default", "fullwidth"] as const,

  /**
   * Parent theme fallback.
   * Set to "default" so any template not implemented here inherits from Default.
   * WordPress equivalent: "Template:" header in style.css
   */
  fallback: "default" as const,
} as const;
