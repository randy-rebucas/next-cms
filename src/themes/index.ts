/**
 * themes/index.ts
 *
 * Theme registry — lists all available themes for the admin UI.
 * Add an entry here whenever a new theme is added to src/themes/.
 *
 * The `id` must match the key used in registerChildTheme() (themes/bootstrap.ts)
 * and the directory name under src/themes/.
 */
import defaultConfig from "./default/config.json";
import minimalConfig from "./minimal/config.json";

export interface ThemeMeta {
  id:          string;
  name:        string;
  version:     string;
  description: string;
  author:      string;
  parent?:     string;
  templates:   string[];
  supports:    string[];
}

/** All registered themes — used by /admin/theme to populate the switcher. */
export const REGISTERED_THEMES: ThemeMeta[] = [
  defaultConfig as ThemeMeta,
  minimalConfig as ThemeMeta,
];
