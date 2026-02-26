/**
 * Public homepage — loads the active theme's home template via the theme loader.
 * WordPress equivalent: front-page.php (dispatched through the template hierarchy)
 *
 * Using the loader (instead of a direct import) means switching the active theme
 * in admin settings will immediately change the homepage template.
 */
import { getActiveTheme, loadHomeTemplate } from "@/core/themes/loader";

export default async function HomePage() {
  const theme = await getActiveTheme();
  const HomeTemplate = await loadHomeTemplate(theme);
  return <HomeTemplate />;
}
