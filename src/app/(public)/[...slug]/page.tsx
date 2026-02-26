import { notFound } from 'next/navigation';
import { type Metadata } from 'next';

import {
  resolveRoute,
  getPost,
  getCmsPage,
  getCategory,
  getTag,
  getPostsByCategory,
  getPostsByTag,
  getActiveThemeSettings,
} from '@/core/content';
import { resolveTheme } from '@/core/themes';
import {
  getActiveTheme,
  loadLayout,
  loadPostTemplate,
  loadPageTemplate,
  loadCategoryTemplate,
  loadArchiveTemplate,
} from '@/core/themes/loader';
import type { Types } from 'mongoose';

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug: segments } = await params;
  const { preview } = await searchParams;
  const route = resolveRoute(segments, preview);
  const SITE = (await import('@/models/Setting').then(m => m.Setting.findOne({ key: 'siteName' }).lean().catch(() => null)) as { value?: string } | null)?.value?.trim() || 'Law Firm';

  if (route.kind === 'post') {
    const post = await getPost(route.slug, route.preview);
    if (!post) return { title: 'Post Not Found' };
    return {
      title: (post.meta?.meta_title as string | undefined) || `${post.title} | ${SITE}`,
      description: (post.meta?.meta_description as string | undefined) || post.excerpt,
      openGraph: {
        title: (post.meta?.meta_title as string | undefined) || post.title,
        description: (post.meta?.meta_description as string | undefined) || post.excerpt,
        images: (post.meta?.og_image as string | undefined) ? [{ url: post.meta.og_image as string }] : [],
      },
    };
  }

  if (route.kind === 'page') {
    const page = await getCmsPage(route.slug);
    if (!page) return { title: 'Page Not Found' };
    return {
      title: page.meta_title || `${page.title} | ${SITE}`,
      description: page.meta_description || page.excerpt,
      openGraph: {
        title: page.meta_title || page.title,
        description: page.meta_description || page.excerpt,
        images: page.og_image ? [{ url: page.og_image }] : [],
      },
    };
  }

  if (route.kind === 'category') {
    const cat = await getCategory(route.slug);
    if (!cat) return { title: 'Category Not Found' };
    return {
      title: `${cat.name} Articles | ${SITE}`,
      description: cat.description || `Browse articles in ${cat.name}`,
    };
  }

  if (route.kind === 'tag') {
    const tag = await getTag(route.slug);
    if (!tag) return { title: 'Tag Not Found' };
    return {
      title: `#${tag.name} Articles | ${SITE}`,
      description: `Browse all articles tagged with ${tag.name}`,
    };
  }

  return { title: 'Not Found' };
}

// ── Page component ────────────────────────────────────────────────────────────

export default async function CatchAllPage({ params, searchParams }: Props) {
  const { slug: segments } = await params;
  const { preview, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));

  // 1. Resolve URL → content type
  const route = resolveRoute(segments, preview);

  // 2. Resolve active theme
  const [themeName, themeSettings] = await Promise.all([
    getActiveTheme(),
    getActiveThemeSettings(),
  ]);
  const theme = resolveTheme({ siteTheme: themeSettings });

  // 3. Load theme layout
  const Layout = await loadLayout(themeName);

  // 4. Dispatch → load matching template → render inside layout
  if (route.kind === 'post') {
    const post = await getPost(route.slug, route.preview);
    if (!post) return notFound();
    const Template = await loadPostTemplate(themeName);
    return <Layout theme={theme}><Template post={post} theme={theme} /></Layout>;
  }

  if (route.kind === 'page') {
    const cmsPage = await getCmsPage(route.slug);
    if (!cmsPage) return notFound();
    const Template = await loadPageTemplate(themeName);
    return <Layout theme={theme}><Template page={cmsPage} theme={theme} /></Layout>;
  }

  if (route.kind === 'category') {
    const category = await getCategory(route.slug);
    if (!category) return notFound();
    const result = await getPostsByCategory(category.slug, { page });
    const Template = await loadCategoryTemplate(themeName);
    return (
      <Layout theme={theme}>
        <Template
          name={category.name}
          slug={category.slug}
          description={category.description}
          posts={result.posts}
          pagination={{ page: result.page, pages: result.pages, total: result.total }}
          basePath={`/blog/category/${category.slug}`}
        />
      </Layout>
    );
  }

  if (route.kind === 'tag') {
    const tag = await getTag(route.slug);
    if (!tag) return notFound();
    const result = await getPostsByTag(tag._id as Types.ObjectId, { page });
    const Template = await loadArchiveTemplate(themeName);
    return (
      <Layout theme={theme}>
        <Template
          kind='tag'
          label={tag.name}
          posts={result.posts}
          pagination={{ page: result.page, pages: result.pages, total: result.total }}
          basePath={`/blog/tag/${tag.slug}`}
        />
      </Layout>
    );
  }

  notFound();
}
