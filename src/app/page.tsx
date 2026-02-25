import db from "@/lib/db";
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
import type { SiteData, PracticeArea, ExperienceEvent, Testimonial, BlogPost, FAQItem } from "@/types/content";
import { resolvePlugins } from "@/lib/plugins";

function tryParse<T>(val: string, fallback: T): T {
  try { return JSON.parse(val) as T; } catch { return fallback; }
}

export default function Home() {
  // ── Site settings ─────────────────────────────────────────────────────────
  const rawSettings = db.prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
  const s: Record<string, unknown> = {};
  for (const { key, value } of rawSettings) {
    s[key] = tryParse<unknown>(value, value);
  }
  const site = s as unknown as SiteData;
  const plugins = resolvePlugins(s);

  // ── Practice Areas ────────────────────────────────────────────────────────
  type DbPA = { id: number; icon: string; title: string; description: string; bullets: string; color: string; bg: string };
  const areas: PracticeArea[] = (
    db.prepare("SELECT * FROM practice_areas WHERE status = 'published' ORDER BY sort_order").all() as DbPA[]
  ).map((r) => ({
    id: String(r.id),
    icon: r.icon,
    title: r.title,
    description: r.description,
    bullets: tryParse<string[]>(r.bullets, []),
    color: r.color,
    bg: r.bg,
  }));

  // ── Experience ────────────────────────────────────────────────────────────
  type DbEE = { id: number; year: string; title: string; subtitle: string; description: string };
  const events: ExperienceEvent[] = (
    db.prepare("SELECT * FROM experience_events ORDER BY sort_order").all() as DbEE[]
  ).map((r) => ({
    id: String(r.id),
    year: r.year,
    title: r.title,
    subtitle: r.subtitle,
    description: r.description,
  }));

  // ── Testimonials ──────────────────────────────────────────────────────────
  type DbT = { id: number; name: string; case_type: string; rating: number; text: string; initials: string; color: string };
  const reviews: Testimonial[] = (
    db.prepare("SELECT * FROM testimonials WHERE status = 'published'").all() as DbT[]
  ).map((r) => ({
    id: String(r.id),
    name: r.name,
    case: r.case_type,
    rating: r.rating,
    text: r.text,
    initials: r.initials,
    color: r.color,
  }));

  // ── Blog Posts ────────────────────────────────────────────────────────────
  type DbPost = { id: number; slug: string; category: string; title: string; excerpt: string; author: string; read_time: string; tag_css: string; created_at: string };
  const posts: BlogPost[] = (
    db.prepare("SELECT id, slug, category, title, excerpt, author, read_time, tag_css, created_at FROM posts WHERE status = 'published' ORDER BY created_at DESC LIMIT 6").all() as DbPost[]
  ).map((r) => ({
    id: String(r.id),
    slug: r.slug,
    category: r.category,
    title: r.title,
    excerpt: r.excerpt,
    author: r.author,
    date: new Date(r.created_at).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }),
    readTime: r.read_time,
    tag: r.tag_css,
  }));

  // ── FAQs ──────────────────────────────────────────────────────────────────
  type DbFaq = { id: number; question: string; answer: string };
  const faqs: FAQItem[] = (
    db.prepare("SELECT * FROM faqs WHERE status = 'published' ORDER BY sort_order").all() as DbFaq[]
  ).map((r) => ({
    id: String(r.id),
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
