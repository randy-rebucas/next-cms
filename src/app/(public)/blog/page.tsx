/**
 * Public blog index — /blog
 * WordPress equivalent: home.php / index.php (when blog page is set)
 *
 * Renders all published posts in reverse-chronological order with pagination.
 * Goes through the theme loader so the active theme controls the layout.
 */
import { type Metadata } from "next";
import { getActiveTheme, loadLayout, loadArchiveTemplate } from "@/core/themes/loader";
import { getAllPosts, getActiveThemeSettings } from "@/core/content";
import { resolveTheme } from "@/core/themes";

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Blog | Articles",
    description: "Browse all published articles and legal insights.",
  };
}

export default async function BlogIndexPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));

  const [themeName, themeSettings, result] = await Promise.all([
    getActiveTheme(),
    getActiveThemeSettings(),
    getAllPosts({ page, limit: 12 }),
  ]);

  const theme    = resolveTheme({ siteTheme: themeSettings });
  const Layout   = await loadLayout(themeName);
  const Template = await loadArchiveTemplate(themeName);

  return (
    <Layout theme={theme}>
      <Template
        kind="blog"
        label="All Articles"
        posts={result.posts}
        pagination={{ page: result.page, pages: result.pages, total: result.total }}
        basePath="/blog"
      />
    </Layout>
  );
}
