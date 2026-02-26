/**
 * Minimal theme — home.tsx
 * WordPress equivalent: front-page.php
 *
 * Clean, editorial homepage. No elaborate animations or marketing sections.
 * Shows site info, recent posts, and contact details in a content-first layout.
 */
import Link from "next/link";
import { Phone, Mail, MapPin, ArrowRight, Clock, User } from "lucide-react";
import connectDB from "@/lib/mongoose";
import { Setting } from "@/models/Setting";
import { Post as PostModel } from "@/models/Post";
import { Menu } from "@/models/Menu";
import MinimalNavbar from "../components/Navbar";
import MinimalFooter from "../components/Footer";
import type { NavItem } from "../components/Navbar";
import type { SiteData } from "@/models/content";

function tryParse<T>(val: string, fallback: T): T {
  try { return JSON.parse(val) as T; } catch { return fallback; }
}

export default async function MinimalHomeTemplate() {
  await connectDB();

  // ── Site settings ──────────────────────────────────────────────────────────
  const settingRows = await Setting.find().lean() as { key: string; value: string }[];
  const s: Record<string, unknown> = {};
  for (const { key, value } of settingRows) s[key] = tryParse<unknown>(value, value);
  const site = s as unknown as SiteData;

  // ── Navigation ─────────────────────────────────────────────────────────────
  const [primaryMenu, footerMenu] = await Promise.all([
    Menu.findOne({ location: "primary" }).lean() as Promise<{ items?: NavItem[] } | null>,
    Menu.findOne({ location: "footer"  }).lean() as Promise<{ items?: NavItem[] } | null>,
  ]);
  const sortItems = (items: (NavItem & { order?: number })[]) =>
    items.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const primaryItems = sortItems((primaryMenu?.items ?? []) as (NavItem & { order?: number })[]);
  const footerItems  = sortItems((footerMenu?.items  ?? []) as (NavItem & { order?: number })[]);
  const siteName = (s.siteName as string | undefined) ?? "";
  const logoUrl  = (s.logoUrl  as string | undefined) ?? "";

  // ── Recent posts ───────────────────────────────────────────────────────────
  const rawPosts = await PostModel
    .find({ status: "published" })
    .select("slug title excerpt author_name read_time createdAt")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return (
    <>
      <MinimalNavbar
        items={primaryItems}
        siteName={siteName || undefined}
        logoUrl={logoUrl || undefined}
      />

      <main className="bg-slate-50 text-slate-900">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-6 py-16 sm:py-24">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--gold,#2563eb)] mb-3">
              {site?.credentials ?? "Licensed Attorney"}
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 leading-tight">
              {site?.name ?? "Your Law Firm"}
              {site?.nameHighlight && (
                <span className="text-[var(--gold,#2563eb)]"> {site.nameHighlight}</span>
              )}
            </h1>
            <p className="text-lg text-slate-600 mb-2 font-medium">
              {site?.title ?? "Experienced Legal Representation"}
            </p>
            <p className="text-slate-500 max-w-2xl mb-8 leading-relaxed">
              {site?.description ?? "Dedicated legal services tailored to your needs. We are committed to protecting your rights and achieving the best possible outcome."}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="#contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--gold,#2563eb)] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm"
              >
                Get in Touch <ArrowRight size={15} />
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:border-slate-500 transition-colors text-sm"
              >
                Read Articles
              </Link>
            </div>
          </div>
        </section>

        {/* ── Recent articles ───────────────────────────────────────────────── */}
        {rawPosts.length > 0 && (
          <section className="max-w-5xl mx-auto px-6 py-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-800">Recent Articles</h2>
              <Link
                href="/blog"
                className="text-sm text-[var(--gold,#2563eb)] hover:underline flex items-center gap-1"
              >
                View all <ArrowRight size={13} />
              </Link>
            </div>
            <div className="space-y-4">
              {rawPosts.map((post) => (
                <article
                  key={String(post._id)}
                  className="bg-white border border-slate-200 rounded-xl p-5 hover:border-[var(--gold,#2563eb)] transition-colors group"
                >
                  <Link href={`/blog/${post.slug}`}>
                    <h3 className="font-semibold text-slate-800 group-hover:text-[var(--gold,#2563eb)] transition-colors mb-1.5">
                      {post.title}
                    </h3>
                  </Link>
                  {post.excerpt && (
                    <p className="text-sm text-slate-500 line-clamp-2 mb-3">{post.excerpt}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    {post.author_name && (
                      <span className="flex items-center gap-1">
                        <User size={11} /> {post.author_name}
                      </span>
                    )}
                    {post.read_time && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {post.read_time}
                      </span>
                    )}
                    <span className="ml-auto">
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ── Contact ──────────────────────────────────────────────────────── */}
        <section id="contact" className="border-t border-slate-200 bg-white">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Contact</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {(site?.phone || site?.phoneHref) && (
                <a
                  href={site.phoneHref ?? `tel:${site.phone}`}
                  className="flex items-center gap-3 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <Phone size={18} className="text-[var(--gold,#2563eb)] shrink-0" />
                  <span className="text-sm">{site.phone ?? "Call Us"}</span>
                </a>
              )}
              {(site?.email || site?.emailHref) && (
                <a
                  href={site.emailHref ?? `mailto:${site.email}`}
                  className="flex items-center gap-3 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <Mail size={18} className="text-[var(--gold,#2563eb)] shrink-0" />
                  <span className="text-sm">{site.email ?? "Email Us"}</span>
                </a>
              )}
              {site?.mapAddress && (
                <div className="flex items-center gap-3 text-slate-600">
                  <MapPin size={18} className="text-[var(--gold,#2563eb)] shrink-0" />
                  <span className="text-sm">
                    {[site.mapAddress, site.mapAddress2].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <MinimalFooter site={site as Partial<SiteData>} footerItems={footerItems} />
    </>
  );
}
