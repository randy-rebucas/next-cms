import connectDB from "@/lib/mongoose";
import { Setting } from "@/models/Setting";
import { Post as PostModel } from "@/models/Post";
import { Menu } from "@/models/Menu";
import { FAQ as FAQModel } from "@/models/FAQ";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import PracticeAreas from "../components/PracticeAreas";
import Experience from "../components/Experience";
import FAQComponent from "../components/FAQ";
import Blog from "../components/Blog";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import { ToolsSection } from "@/plugins/tools-section";
import { Testimonials } from "@/plugins/testimonials";
import type { SiteData, BlogPost, FAQItem } from "@/models/content";
import type { NavItem } from "../components/Navbar";
import { resolvePlugins } from "@/core/plugins";

function tryParse<T>(val: string, fallback: T): T {
  try { return JSON.parse(val) as T; } catch { return fallback; }
}

/**
 * Default theme — homepage template.
 * WordPress equivalent: front-page.php
 * Each section is either self-fetching (server component) or receives minimal props.
 */
export default async function HomeTemplate() {
  await connectDB();

  // ── Site settings ─────────────────────────────────────────────────────────
  const settingRows = await Setting.find().lean() as { key: string; value: string }[];
  const s: Record<string, unknown> = {};
  for (const { key, value } of settingRows) s[key] = tryParse<unknown>(value, value);
  const site = s as unknown as SiteData;
  const plugins = resolvePlugins(s);

  // ── Navigation menus (WordPress: wp_nav_menu) ─────────────────────────────
  const [primaryMenu, footerMenu] = await Promise.all([
    Menu.findOne({ location: "primary" }).lean() as Promise<{ items?: NavItem[] } | null>,
    Menu.findOne({ location: "footer"  }).lean() as Promise<{ items?: NavItem[] } | null>,
  ]);
  const primaryItems = (primaryMenu?.items ?? [])
    .slice().sort((a: NavItem & { order?: number }, b: NavItem & { order?: number }) => (a.order ?? 0) - (b.order ?? 0));
  const footerItems = (footerMenu?.items ?? [])
    .slice().sort((a: NavItem & { order?: number }, b: NavItem & { order?: number }) => (a.order ?? 0) - (b.order ?? 0));

  const siteName  = (s.siteName  as string | undefined) ?? "";
  const logoUrl   = (s.logoUrl   as string | undefined) ?? "";

  // ── Blog posts (for Blog section) ────────────────────────────────────────
  const rawPosts = await PostModel
    .find({ status: "published" })
    .select("slug title excerpt author_name read_time tag_css categories createdAt")
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();
  const posts: BlogPost[] = rawPosts.map((r) => ({
    id: String(r._id),
    slug: r.slug,
    category: "",
    title: r.title,
    excerpt: r.excerpt ?? "",
    author: r.author_name ?? "",
    date: new Date(r.createdAt).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }),
    readTime: r.read_time ?? "",
    tag: r.tag_css ?? "",
  }));

  // ── FAQs (client component needs data passed in) ─────────────────────────
  const rawFaqs = await FAQModel.find({ status: "published" }).sort({ sort_order: 1 }).lean();
  const faqs: FAQItem[] = rawFaqs.map((r) => ({ id: String(r._id), q: r.question, a: r.answer }));

  // Testimonials component uses its own built-in defaults; no data passed here.

  return (
    <>
      <Navbar
        items={primaryItems}
        siteName={siteName || undefined}
        logoUrl={logoUrl  || undefined}
      />
      <main className="pt-16">
        <Hero site={site} />
        <About site={site} />

        {/* PracticeAreas + Experience self-fetch their own data */}
        {plugins.has("practice-areas") && <PracticeAreas />}
        {plugins.has("experience")     && <Experience />}

        {plugins.has("tools-section") && (
          <ToolsSection
            enabledTabs={{
              sol:        plugins.has("sol-calculator"),
              glossary:   plugins.has("legal-glossary"),
              checklist:  plugins.has("document-checklist"),
              booking:    plugins.has("consultation-booking"),
              evaluation: plugins.has("case-evaluation"),
            }}
          />
        )}

        {plugins.has("testimonials") && <Testimonials />}
        {plugins.has("faq")  && <FAQComponent faqs={faqs.length ? faqs : undefined} />}
        {plugins.has("blog") && <Blog posts={posts.length ? posts : undefined} />}

        <Contact site={site} />
      </main>
      <Footer
        site={site}
        footerItems={footerItems}
      />
    </>
  );
}
