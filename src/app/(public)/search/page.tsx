import type { Metadata } from "next";
import connectDB from "@/lib/mongoose";
import { Post } from "@/models/Post";
import { Page } from "@/models/Page";
import { getActiveTheme, loadLayout, loadSearchTemplate } from "@/core/themes/loader";
import { getActiveThemeSettings } from "@/core/content";
import { resolveTheme } from "@/core/themes";
import type { SearchResult } from "@/themes/default/templates/search";

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: "${q}"` : "Search",
    description: q ? `Search results for "${q}"` : "Search the site",
  };
}

async function search(q: string, page: number): Promise<{ results: SearchResult[]; total: number }> {
  await connectDB();
  const skip = (page - 1) * 10;

  try {
    const textFilter = { $text: { $search: q }, status: "published" };

    const [postResults, pageResults] = await Promise.all([
      Post.find(textFilter, { score: { $meta: "textScore" } })
        .select("title slug excerpt createdAt")
        .sort({ score: { $meta: "textScore" } })
        .skip(skip)
        .limit(8)
        .lean(),
      Page.find({ $text: { $search: q }, status: "published" }, { score: { $meta: "textScore" } })
        .select("title slug excerpt meta_description createdAt")
        .sort({ score: { $meta: "textScore" } })
        .skip(skip)
        .limit(3)
        .lean(),
    ]);

    const results: SearchResult[] = [
      ...postResults.map((p) => ({
        type: "post" as const,
        _id: String((p as { _id: unknown })._id),
        title: (p as { title: string }).title,
        slug: (p as { slug: string }).slug,
        excerpt: (p as { excerpt?: string }).excerpt,
        url: `/blog/${(p as { slug: string }).slug}`,
        date: ((p as { createdAt: Date }).createdAt).toISOString(),
      })),
      ...pageResults.map((p) => ({
        type: "page" as const,
        _id: String((p as { _id: unknown })._id),
        title: (p as { title: string }).title,
        slug: (p as { slug: string }).slug,
        excerpt: (p as { excerpt?: string; meta_description?: string }).excerpt || (p as { meta_description?: string }).meta_description,
        url: `/${(p as { slug: string }).slug}`,
        date: ((p as { createdAt: Date }).createdAt).toISOString(),
      })),
    ];

    return { results, total: results.length };
  } catch {
    // Fallback to regex if text index doesn't exist yet
    const [postResults, pageResults] = await Promise.all([
      Post.find({ title: { $regex: q, $options: "i" }, status: "published" })
        .select("title slug excerpt createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(8)
        .lean(),
      Page.find({ title: { $regex: q, $options: "i" }, status: "published" })
        .select("title slug excerpt meta_description createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(3)
        .lean(),
    ]);

    const results: SearchResult[] = [
      ...postResults.map((p) => ({
        type: "post" as const,
        _id: String((p as { _id: unknown })._id),
        title: (p as { title: string }).title,
        slug: (p as { slug: string }).slug,
        excerpt: (p as { excerpt?: string }).excerpt,
        url: `/blog/${(p as { slug: string }).slug}`,
        date: ((p as { createdAt: Date }).createdAt).toISOString(),
      })),
      ...pageResults.map((p) => ({
        type: "page" as const,
        _id: String((p as { _id: unknown })._id),
        title: (p as { title: string }).title,
        slug: (p as { slug: string }).slug,
        excerpt: (p as { excerpt?: string; meta_description?: string }).excerpt || (p as { meta_description?: string }).meta_description,
        url: `/${(p as { slug: string }).slug}`,
        date: ((p as { createdAt: Date }).createdAt).toISOString(),
      })),
    ];

    return { results, total: results.length };
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, page: pageParam } = await searchParams;
  const query = q?.trim() ?? "";
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));

  let results: SearchResult[] = [];
  let total = 0;

  if (query && query.length >= 2) {
    const data = await search(query, page);
    results = data.results;
    total = data.total;
  }

  // Load active theme layout + search template
  const [themeName, themeSettings] = await Promise.all([
    getActiveTheme(),
    getActiveThemeSettings(),
  ]);
  const theme = resolveTheme({ siteTheme: themeSettings });

  const Layout = await loadLayout(themeName);
  const Template = await loadSearchTemplate(themeName);

  return (
    <Layout theme={theme}>
      <Template query={query} results={results} total={total} />
    </Layout>
  );
}
