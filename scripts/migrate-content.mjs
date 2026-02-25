/**
 * Migration script 2: rewrites content-layer and page files from SQLite to Mongoose.
 * Run: node scripts/migrate-content.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function write(relPath, content) {
  const full = path.join(root, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf-8");
  console.log("  wrote:", relPath);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Update Post model to add tags field
// ─────────────────────────────────────────────────────────────────────────────
write("src/lib/models/Post.ts", `import { Schema, model, models, Document, Types } from "mongoose";

export interface IPost extends Document {
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  status: string;
  category: string;
  author: string;
  read_time: string;
  tag_css: string;
  featured_image: string;
  meta_title: string;
  meta_description: string;
  og_image: string;
  preview_token: string | null;
  tags: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true, default: "" },
    content: { type: String, default: "" },
    excerpt: { type: String, default: "" },
    status: { type: String, default: "draft" },
    category: { type: String, default: "" },
    author: { type: String, default: "Atty. Levi Baligod" },
    read_time: { type: String, default: "5 min read" },
    tag_css: { type: String, default: "bg-slate-100 text-slate-600" },
    featured_image: { type: String, default: "" },
    meta_title: { type: String, default: "" },
    meta_description: { type: String, default: "" },
    og_image: { type: String, default: "" },
    preview_token: { type: String, default: null },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
  },
  { timestamps: true }
);

export const Post = models.Post ?? model<IPost>("Post", PostSchema);
`);

// ─────────────────────────────────────────────────────────────────────────────
// 2. core/content/index.ts — all async with Mongoose
// ─────────────────────────────────────────────────────────────────────────────
write("src/core/content/index.ts", `/**
 * core/content
 * All public-facing content queries in one place.
 * All functions are async and use Mongoose.
 */
import connectDB from "@/lib/mongoose";
import { Post } from "@/lib/models/Post";
import { Page } from "@/lib/models/Page";
import { Category } from "@/lib/models/Category";
import { Tag } from "@/lib/models/Tag";
import { Setting } from "@/lib/models/Setting";
import type { Types } from "mongoose";

// ── Shared row types ─────────────────────────────────────────────────────────

export type PostRow = {
  _id: Types.ObjectId;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  status: string;
  category: string;
  author: string;
  read_time: string;
  tag_css: string;
  createdAt: Date;
  updatedAt: Date;
  featured_image: string;
  meta_title: string;
  meta_description: string;
  og_image: string;
  preview_token: string | null;
};

export type PageRow = {
  _id: Types.ObjectId;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  status: string;
  author: string;
  featured_image: string;
  meta_title: string;
  meta_description: string;
  og_image: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CategoryRow = {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
};

export type TagRow = {
  _id: Types.ObjectId;
  name: string;
  slug: string;
};

export type ArchivePostRow = Pick<
  PostRow,
  "_id" | "title" | "slug" | "excerpt" | "author" | "read_time" | "category" | "tag_css" | "createdAt"
>;

// ── Query helpers ────────────────────────────────────────────────────────────

export async function getPost(
  slug: string,
  previewToken?: string
): Promise<PostRow | null> {
  await connectDB();
  if (previewToken) {
    const doc = await Post.findOne({
      slug,
      $or: [{ status: "published" }, { preview_token: previewToken }],
    }).lean();
    return (doc as PostRow | null);
  }
  return Post.findOne({ slug, status: "published" }).lean() as Promise<PostRow | null>;
}

export async function getCmsPage(slug: string): Promise<PageRow | null> {
  await connectDB();
  return Page.findOne({ slug, status: "published" }).lean() as Promise<PageRow | null>;
}

export async function getCategory(slug: string): Promise<CategoryRow | null> {
  await connectDB();
  return Category.findOne({ slug }).lean() as Promise<CategoryRow | null>;
}

export async function getTag(slug: string): Promise<TagRow | null> {
  await connectDB();
  return Tag.findOne({ slug }).lean() as Promise<TagRow | null>;
}

export async function getPostsByCategory(
  categoryName: string
): Promise<ArchivePostRow[]> {
  await connectDB();
  return Post.find({ category: categoryName, status: "published" })
    .select("title slug excerpt author read_time category tag_css createdAt")
    .sort({ createdAt: -1 })
    .lean() as Promise<ArchivePostRow[]>;
}

export async function getPostsByTag(
  tagId: Types.ObjectId
): Promise<ArchivePostRow[]> {
  await connectDB();
  return Post.find({ tags: tagId, status: "published" })
    .select("title slug excerpt author read_time category tag_css createdAt")
    .sort({ createdAt: -1 })
    .lean() as Promise<ArchivePostRow[]>;
}

/** Read the active theme JSON from settings; returns raw parsed object. */
export async function getActiveThemeSettings(): Promise<Record<string, unknown>> {
  try {
    await connectDB();
    const row = await Setting.findOne({ key: "siteTheme" }).lean() as { value?: string } | null;
    return row?.value ? (JSON.parse(row.value) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

// ── URL resolution ───────────────────────────────────────────────────────────

export type RouteType =
  | { kind: "post"; slug: string; preview?: string }
  | { kind: "category"; slug: string }
  | { kind: "tag"; slug: string }
  | { kind: "page"; slug: string }
  | { kind: "not-found" };

/**
 * Determine what kind of content a URL path maps to.
 * Segments = pathname.split("/").filter(Boolean)
 *
 *  blog/<slug>            → post
 *  blog/category/<slug>   → category archive
 *  blog/tag/<slug>        → tag archive
 *  <slug>                 → CMS page
 */
export function resolveRoute(segments: string[], preview?: string): RouteType {
  if (segments[0] === "blog") {
    if (segments[1] === "category" && segments[2]) return { kind: "category", slug: segments[2] };
    if (segments[1] === "tag" && segments[2]) return { kind: "tag", slug: segments[2] };
    if (segments[1]) return { kind: "post", slug: segments[1], preview };
    return { kind: "not-found" };
  }
  if (segments.length === 1) return { kind: "page", slug: segments[0] };
  return { kind: "not-found" };
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// 3. core/themes/loader.ts — getActiveTheme becomes async
// ─────────────────────────────────────────────────────────────────────────────
write("src/core/themes/loader.ts", `/**
 * core/themes/loader.ts
 *
 * Theme loader — resolves the active theme name and dynamically imports
 * the correct layout / template for a given content type.
 */
import connectDB from "@/lib/mongoose";
import { Setting } from "@/lib/models/Setting";
import type { SiteTheme } from "@/core/themes";
import type { PostTemplateProps } from "@/themes/default/templates/post";
import type { PageTemplateProps } from "@/themes/default/templates/page";
import type { ArchiveTemplateProps } from "@/themes/default/templates/archive";

// ── Known theme names ────────────────────────────────────────────────────────

export type ThemeName = keyof typeof REGISTRY;
export type TemplateType = "post" | "page" | "archive";

// ── Static registry ──────────────────────────────────────────────────────────

const REGISTRY = {
  default: {
    layout:  () => import("@/themes/default/layout"),
    post:    () => import("@/themes/default/templates/post"),
    page:    () => import("@/themes/default/templates/page"),
    archive: () => import("@/themes/default/templates/archive"),
  },
} as const;

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Read the active theme name from settings.
 * Falls back to "default" if unset or unknown.
 */
export async function getActiveTheme(): Promise<ThemeName> {
  try {
    await connectDB();
    const row = await Setting.findOne({ key: "activeTheme" }).lean() as { value?: string } | null;
    const name = row?.value?.trim() ?? "default";
    return (name in REGISTRY ? name : "default") as ThemeName;
  } catch {
    return "default";
  }
}

// ── Layout loader ────────────────────────────────────────────────────────────

type LayoutModule = { default: React.ComponentType<{ children: React.ReactNode; theme: SiteTheme }> };

export async function loadLayout(theme: ThemeName): Promise<LayoutModule["default"]> {
  const entry = REGISTRY[theme] ?? REGISTRY.default;
  const mod = await entry.layout() as LayoutModule;
  return mod.default;
}

// ── Template loaders ─────────────────────────────────────────────────────────

type PostModule    = { default: React.ComponentType<PostTemplateProps> };
type PageModule    = { default: React.ComponentType<PageTemplateProps> };
type ArchiveModule = { default: React.ComponentType<ArchiveTemplateProps> };

export async function loadPostTemplate(theme: ThemeName): Promise<PostModule["default"]> {
  const entry = REGISTRY[theme] ?? REGISTRY.default;
  const mod = await entry.post() as PostModule;
  return mod.default;
}

export async function loadPageTemplate(theme: ThemeName): Promise<PageModule["default"]> {
  const entry = REGISTRY[theme] ?? REGISTRY.default;
  const mod = await entry.page() as PageModule;
  return mod.default;
}

export async function loadArchiveTemplate(theme: ThemeName): Promise<ArchiveModule["default"]> {
  const entry = REGISTRY[theme] ?? REGISTRY.default;
  const mod = await entry.archive() as ArchiveModule;
  return mod.default;
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// 4. plugins/bootstrap.ts — sync, register all plugins immediately
// ─────────────────────────────────────────────────────────────────────────────
write("src/plugins/bootstrap.ts", `/**
 * plugins/bootstrap.ts
 *
 * Singleton that registers all plugins exactly once per process.
 * All plugins are registered synchronously at startup; individual plugins
 * control their own activation based on their settings (e.g., analyticsId).
 *
 * Usage — import as a side-effect anywhere that runs once at startup:
 *   import "@/plugins/bootstrap";
 */
import { seoPlugin } from "@/plugins/seo";
import { analyticsPlugin } from "@/plugins/analytics";
import type { PluginManifest } from "@/core/plugins";

const ALL_PLUGINS: PluginManifest[] = [seoPlugin, analyticsPlugin];

let _bootstrapped = false;

export function bootstrap(): void {
  if (_bootstrapped) return;
  _bootstrapped = true;

  for (const plugin of ALL_PLUGINS) {
    plugin.register();
  }
}

// Auto-run on import
bootstrap();
`);

// ─────────────────────────────────────────────────────────────────────────────
// 5. plugins/analytics/index.ts — async getAnalyticsId
// ─────────────────────────────────────────────────────────────────────────────
write("src/plugins/analytics/index.ts", `/**
 * plugins/analytics/index.ts
 *
 * Analytics plugin — injects a Google Analytics 4 (gtag.js) snippet into
 * every page's <head> when \`settings.analyticsId\` is configured.
 */
import { registerHook } from "@/core/plugins/hooks";
import connectDB from "@/lib/mongoose";
import { Setting } from "@/lib/models/Setting";
import type { PluginManifest } from "@/core/plugins";

async function getAnalyticsId(): Promise<string | null> {
  try {
    await connectDB();
    const row = await Setting.findOne({ key: "analyticsId" }).lean() as { value?: string } | null;
    return row?.value?.trim() || null;
  } catch {
    return null;
  }
}

export const analyticsPlugin: PluginManifest = {
  id: "analytics",
  register() {
    registerHook("filterHeadScripts", async (payload) => {
      const id = await getAnalyticsId();
      if (!id) return payload;
      return {
        scripts: [
          ...payload.scripts,
          \`<script async src="https://www.googletagmanager.com/gtag/js?id=\${id}"></script>\`,
          \`<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','\${id}');</script>\`,
        ],
      };
    });
  },
};
`);

// ─────────────────────────────────────────────────────────────────────────────
// 6. app/layout.tsx — async theme CSS via Mongoose
// ─────────────────────────────────────────────────────────────────────────────
write("src/app/layout.tsx", `import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import connectDB from "@/lib/mongoose";
import { Setting } from "@/lib/models/Setting";
import { buildThemeCss, resolveTheme } from "@/core/themes";
import { triggerHook } from "@/core/plugins/hooks";
import "@/plugins/bootstrap";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Atty. Levito 'Levi' Baligod | Anti-Corruption Lawyer Philippines",
  description:
    "Atty. Levito 'Levi' Baligod is a Filipino anti-corruption lawyer and public interest advocate known for representing PDAF scam whistleblowers and filing malversation cases against public officials.",
  keywords:
    "Levi Baligod, Filipino lawyer, anti-corruption, PDAF scam, pork barrel, public interest litigation, criminal law Philippines",
};

async function getThemeCss(): Promise<string> {
  try {
    await connectDB();
    const row = await Setting.findOne({ key: "siteTheme" }).lean() as { value?: string } | null;
    const parsed = row?.value ? (JSON.parse(row.value) as Record<string, unknown>) : {};
    return buildThemeCss(resolveTheme({ siteTheme: parsed }));
  } catch {
    return "";
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [themeCss, { scripts: headScripts }] = await Promise.all([
    getThemeCss(),
    triggerHook("filterHeadScripts", { scripts: [] }),
  ]);

  return (
    <html lang="en">
      <head>
        {themeCss && (
          <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        )}
        {headScripts.map((script, i) => (
          <div
            key={i}
            dangerouslySetInnerHTML={{ __html: script }}
          />
        ))}
      </head>
      <body
        className={\`\${geistSans.variable} \${geistMono.variable} antialiased\`}
      >
        {children}
      </body>
    </html>
  );
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// 7. app/(public)/page.tsx — async with Mongoose
// ─────────────────────────────────────────────────────────────────────────────
write("src/app/(public)/page.tsx", `import connectDB from "@/lib/mongoose";
import { Setting } from "@/lib/models/Setting";
import { PracticeArea as PracticeAreaModel } from "@/lib/models/PracticeArea";
import { Experience as ExperienceModel } from "@/lib/models/Experience";
import { Testimonial as TestimonialModel } from "@/lib/models/Testimonial";
import { Post as PostModel } from "@/lib/models/Post";
import { FAQ as FAQModel } from "@/lib/models/FAQ";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import PracticeAreas from "@/components/PracticeAreas";
import Experience from "@/components/Experience";
import ToolsSection from "@/components/ToolsSection";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Blog from "@/components/Blog";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import type { SiteData, PracticeArea, ExperienceEvent, Testimonial, BlogPost, FAQItem } from "@/models/content";
import { resolvePlugins } from "@/core/plugins";

function tryParse<T>(val: string, fallback: T): T {
  try { return JSON.parse(val) as T; } catch { return fallback; }
}

export default async function Home() {
  await connectDB();

  // ── Site settings ─────────────────────────────────────────────────────────
  const settingRows = await Setting.find().lean() as { key: string; value: string }[];
  const s: Record<string, unknown> = {};
  for (const { key, value } of settingRows) {
    s[key] = tryParse<unknown>(value, value);
  }
  const site = s as unknown as SiteData;
  const plugins = resolvePlugins(s);

  // ── Practice Areas ────────────────────────────────────────────────────────
  const rawAreas = await PracticeAreaModel.find({ status: "published" })
    .sort({ sort_order: 1 }).lean();
  const areas: PracticeArea[] = rawAreas.map((r) => ({
    id: String(r._id),
    icon: r.icon,
    title: r.title,
    description: r.description,
    bullets: r.bullets ?? [],
    color: r.color,
    bg: r.bg,
  }));

  // ── Experience ────────────────────────────────────────────────────────────
  const rawEvents = await ExperienceModel.find().sort({ sort_order: 1 }).lean();
  const events: ExperienceEvent[] = rawEvents.map((r) => ({
    id: String(r._id),
    year: r.year,
    title: r.title,
    subtitle: r.subtitle,
    description: r.description,
  }));

  // ── Testimonials ──────────────────────────────────────────────────────────
  const rawReviews = await TestimonialModel.find({ status: "published" }).lean();
  const reviews: Testimonial[] = rawReviews.map((r) => ({
    id: String(r._id),
    name: r.name,
    case: r.case_type,
    rating: r.rating,
    text: r.text,
    initials: r.initials,
    color: r.color,
  }));

  // ── Blog Posts ────────────────────────────────────────────────────────────
  const rawPosts = await PostModel.find({ status: "published" })
    .select("slug category title excerpt author read_time tag_css createdAt")
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();
  const posts: BlogPost[] = rawPosts.map((r) => ({
    id: String(r._id),
    slug: r.slug,
    category: r.category,
    title: r.title,
    excerpt: r.excerpt,
    author: r.author,
    date: new Date(r.createdAt).toLocaleDateString("en-PH", {
      year: "numeric", month: "long", day: "numeric",
    }),
    readTime: r.read_time,
    tag: r.tag_css,
  }));

  // ── FAQs ──────────────────────────────────────────────────────────────────
  const rawFaqs = await FAQModel.find({ status: "published" })
    .sort({ sort_order: 1 }).lean();
  const faqs: FAQItem[] = rawFaqs.map((r) => ({
    id: String(r._id),
    q: r.question,
    a: r.answer,
  }));

  return (
    <>
      <Navbar />
      <main className="pt-16">
        <Hero site={site} />
        <About site={site} />
        {plugins.has("practice-areas") && <PracticeAreas areas={areas} />}
        {plugins.has("experience") && <Experience events={events} />}
        {plugins.has("tools-section") && (
          <ToolsSection
            enabledTabs={{
              sol: plugins.has("sol-calculator"),
              glossary: plugins.has("legal-glossary"),
              checklist: plugins.has("document-checklist"),
              booking: plugins.has("consultation-booking"),
              evaluation: plugins.has("case-evaluation"),
            }}
          />
        )}
        {plugins.has("testimonials") && <Testimonials reviews={reviews} />}
        {plugins.has("faq") && <FAQ faqs={faqs} />}
        {plugins.has("blog") && <Blog posts={posts} />}
        <Contact site={site} />
      </main>
      <Footer site={site} />
    </>
  );
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// 8. app/(public)/[...slug]/page.tsx — await all content queries
// ─────────────────────────────────────────────────────────────────────────────
write("src/app/(public)/[...slug]/page.tsx", `import { notFound } from 'next/navigation';
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
  const SITE = 'Baligod Law Office';

  if (route.kind === 'post') {
    const post = await getPost(route.slug, route.preview);
    if (!post) return { title: 'Post Not Found' };
    return {
      title: post.meta_title || \`\${post.title} | \${SITE}\`,
      description: post.meta_description || post.excerpt,
      openGraph: {
        title: post.meta_title || post.title,
        description: post.meta_description || post.excerpt,
        images: post.og_image ? [{ url: post.og_image }] : [],
      },
    };
  }

  if (route.kind === 'page') {
    const page = await getCmsPage(route.slug);
    if (!page) return { title: 'Page Not Found' };
    return {
      title: page.meta_title || \`\${page.title} | \${SITE}\`,
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
      title: \`\${cat.name} Articles | \${SITE}\`,
      description: cat.description || \`Browse articles in \${cat.name}\`,
    };
  }

  if (route.kind === 'tag') {
    const tag = await getTag(route.slug);
    if (!tag) return { title: 'Tag Not Found' };
    return {
      title: \`#\${tag.name} Articles | \${SITE}\`,
      description: \`Browse all articles tagged with \${tag.name}\`,
    };
  }

  return { title: 'Not Found' };
}

// ── Page component ────────────────────────────────────────────────────────────

export default async function CatchAllPage({ params, searchParams }: Props) {
  const { slug: segments } = await params;
  const { preview } = await searchParams;

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
    const page = await getCmsPage(route.slug);
    if (!page) return notFound();
    const Template = await loadPageTemplate(themeName);
    return <Layout theme={theme}><Template page={page} theme={theme} /></Layout>;
  }

  if (route.kind === 'category') {
    const category = await getCategory(route.slug);
    if (!category) return notFound();
    const posts = await getPostsByCategory(category.name);
    const Template = await loadArchiveTemplate(themeName);
    return (
      <Layout theme={theme}>
        <Template
          kind='category'
          label={category.name}
          description={category.description}
          posts={posts}
        />
      </Layout>
    );
  }

  if (route.kind === 'tag') {
    const tag = await getTag(route.slug);
    if (!tag) return notFound();
    const posts = await getPostsByTag(tag._id as Types.ObjectId);
    const Template = await loadArchiveTemplate(themeName);
    return (
      <Layout theme={theme}>
        <Template
          kind='tag'
          label={tag.name}
          posts={posts}
        />
      </Layout>
    );
  }

  notFound();
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// 9. app/(admin)/admin/posts/[id]/edit/page.tsx — Mongoose Post.findById
// ─────────────────────────────────────────────────────────────────────────────
write("src/app/(admin)/admin/posts/[id]/edit/page.tsx", `import connectDB from "@/lib/mongoose";
import { Post } from "@/lib/models/Post";
import PostEditor from "@/components/admin/PostEditor";
import { notFound } from "next/navigation";

interface Params { id: string }

export default async function EditPost({ params }: { params: Promise<Params> }) {
  const { id } = await params;

  await connectDB();
  const post = await Post.findById(id).lean() as Record<string, unknown> | null;
  if (!post) notFound();

  return <PostEditor initial={post as Parameters<typeof PostEditor>[0]["initial"]} />;
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// 10. app/api/ai/generate/route.ts — async checkPin + Mongoose Setting
// ─────────────────────────────────────────────────────────────────────────────
write("src/app/api/ai/generate/route.ts", `import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { Setting } from "@/lib/models/Setting";
import { checkPin } from "@/core/auth";

async function getSetting(key: string): Promise<string> {
  await connectDB();
  const row = await Setting.findOne({ key }).lean() as { value?: string } | null;
  return row?.value ?? "";
}

export async function POST(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  const apiKey = (await getSetting("openaiApiKey")) || process.env.OPENAI_API_KEY || "";
  if (!apiKey) {
    return NextResponse.json(
      { error: "No OpenAI API key configured. Add it in Admin → Settings → OpenAI API Key." },
      { status: 400 }
    );
  }

  const { title, prompt, type = "post" } = await req.json();

  const systemPrompts: Record<string, string> = {
    post: \`You are a legal content writer for an anti-corruption Filipino lawyer named Atty. Levito "Levi" Baligod. Write informative, accessible blog posts about Philippine law, anti-corruption topics, and legal rights. Output clean HTML using only: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <blockquote>. No wrapping <html> or <body> tags.\`,
    excerpt: \`Write a 1-2 sentence excerpt for a Philippine law blog post. Return plain text only, no HTML.\`,
    faq_answer: \`You are a Filipino anti-corruption lawyer. Write a clear, helpful answer to a legal FAQ. Use plain text, no HTML.\`,
  };

  const systemPrompt = systemPrompts[type as string] || systemPrompts.post;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: \`Bearer \${apiKey}\`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt || \`Write about: \${title}\` },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    return NextResponse.json(
      { error: (errBody as { error?: { message?: string } }).error?.message || "OpenAI API error" },
      { status: response.status }
    );
  }

  const data = await response.json() as { choices: { message: { content: string } }[] };
  return NextResponse.json({ content: data.choices[0].message.content });
}
`);

console.log("\\nAll content/page files written successfully.");
