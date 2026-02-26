/**
 * Global 404 page — Next.js not-found.tsx.
 * WordPress equivalent: 404.php (dispatched through the template hierarchy)
 *
 * Goes through the theme loader so switching the active theme also changes
 * the 404 page's visual style.
 */
import { getActiveTheme, loadLayout, load404Template } from "@/core/themes/loader";
import { getActiveThemeSettings } from "@/core/content";
import { resolveTheme } from "@/core/themes";

export default async function NotFoundPage() {
  const [themeName, themeSettings] = await Promise.all([
    getActiveTheme(),
    getActiveThemeSettings(),
  ]);
  const theme    = resolveTheme({ siteTheme: themeSettings });
  const Layout   = await loadLayout(themeName);
  const Template = await load404Template(themeName);

  return (
    <Layout theme={theme}>
      <Template />
    </Layout>
  );
}
