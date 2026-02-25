import connectDB from "@/lib/mongoose";
import { Setting } from "@/models/Setting";
import { PracticeArea as PracticeAreaModel } from "@/models/PracticeArea";
import { Experience as ExperienceModel } from "@/models/Experience";
import { Testimonial as TestimonialModel } from "@/models/Testimonial";
import { Post as PostModel } from "@/models/Post";
import { FAQ as FAQModel } from "@/models/FAQ";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import PracticeAreas from "../components/PracticeAreas";
import Experience from "../components/Experience";
import { ToolsSection } from "@/plugins/tools-section";
import { Testimonials } from "@/plugins/testimonials";
import FAQ from "../components/FAQ";
import Blog from "../components/Blog";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import type {
  SiteData,
  PracticeArea,
  ExperienceEvent,
  Testimonial,
  BlogPost,
  FAQItem,
} from "@/models/content";
import { resolvePlugins } from "@/core/plugins";

function tryParse<T>(val: string, fallback: T): T {
  try {
    return JSON.parse(val) as T;
  } catch {
    return fallback;
  }
}

/**
 * Default theme — homepage template.
 * Contains all data fetching and renders all public sections.
 */
export default async function HomeTemplate() {
  await connectDB();

  // ── Site settings ────────────────────────────────────────────────────────
  const settingRows = await Setting.find().lean() as { key: string; value: string }[];
  const s: Record<string, unknown> = {};
  for (const { key, value } of settingRows) {
    s[key] = tryParse<unknown>(value, value);
  }
  const site = s as unknown as SiteData;
  const plugins = resolvePlugins(s);

  // ── Practice Areas ───────────────────────────────────────────────────────
  const rawAreas = await PracticeAreaModel.find({ status: "published" })
    .sort({ sort_order: 1 })
    .lean();
  const areas: PracticeArea[] = rawAreas.map((r) => ({
    id: String(r._id),
    icon: r.icon,
    title: r.title,
    description: r.description,
    bullets: r.bullets ?? [],
    color: r.color,
    bg: r.bg,
  }));

  // ── Experience ───────────────────────────────────────────────────────────
  const rawEvents = await ExperienceModel.find().sort({ sort_order: 1 }).lean();
  const events: ExperienceEvent[] = rawEvents.map((r) => ({
    id: String(r._id),
    year: r.year,
    title: r.title,
    subtitle: r.subtitle,
    description: r.description,
  }));

  // ── Testimonials ─────────────────────────────────────────────────────────
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

  // ── Blog Posts ───────────────────────────────────────────────────────────
  const rawPosts = await PostModel.find({ status: "published" })
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
    date: new Date(r.createdAt).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    readTime: r.read_time ?? "",
    tag: r.tag_css ?? "",
  }));

  // ── FAQs ─────────────────────────────────────────────────────────────────
  const rawFaqs = await FAQModel.find({ status: "published" })
    .sort({ sort_order: 1 })
    .lean();
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
