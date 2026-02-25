"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Briefcase, Star, HelpCircle, Clock, PlusCircle, Settings } from "lucide-react";
import { useAdminAuth } from "@/app/admin/layout";

interface Stats {
  posts_total: number;
  posts_published: number;
  posts_draft: number;
  practice_areas: number;
  testimonials: number;
  faqs: number;
  experience: number;
}

interface Post {
  id: number;
  title: string;
  status: string;
  category: string;
  created_at: string;
}

export default function Dashboard() {
  const { pin } = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Post[]>([]);

  useEffect(() => {
    if (!pin) return;
    (async () => {
      try {
        const h = { "x-admin-pin": pin };
        const [posts, pa, tl, fq, ex] = await Promise.all([
          fetch("/api/db/posts", { headers: h }).then((r) => r.json()),
          fetch("/api/db/practice-areas", { headers: h }).then((r) => r.json()),
          fetch("/api/db/testimonials", { headers: h }).then((r) => r.json()),
          fetch("/api/db/faq", { headers: h }).then((r) => r.json()),
          fetch("/api/db/experience", { headers: h }).then((r) => r.json()),
        ]) as [Post[], unknown[], unknown[], unknown[], unknown[]];
        setStats({
          posts_total: posts.length,
          posts_published: posts.filter((p: Post) => p.status === "published").length,
          posts_draft: posts.filter((p: Post) => p.status === "draft").length,
          practice_areas: pa.length,
          testimonials: tl.length,
          faqs: fq.length,
          experience: ex.length,
        });
        setRecent(posts.slice(0, 5));
      } catch {
        // network or parse error — leave stats as null (skeleton stays visible)
      }
    })();
  }, [pin]);

  const cards = stats
    ? [
        { label: "Posts", value: stats.posts_total, sub: `${stats.posts_published} published · ${stats.posts_draft} drafts`, icon: FileText, color: "text-amber-400", href: "/admin/posts" },
        { label: "Practice Areas", value: stats.practice_areas, sub: "Active services", icon: Briefcase, color: "text-blue-400", href: "/admin/practice-areas" },
        { label: "Testimonials", value: stats.testimonials, sub: "Client reviews", icon: Star, color: "text-green-400", href: "/admin/testimonials" },
        { label: "FAQs", value: stats.faqs, sub: "Answered questions", icon: HelpCircle, color: "text-purple-400", href: "/admin/faq" },
        { label: "Experience", value: stats.experience, sub: "Timeline events", icon: Clock, color: "text-rose-400", href: "/admin/experience" },
      ]
    : [];

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Welcome to Baligod Law CMS</p>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href="/admin/posts/new"
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <PlusCircle size={16} />
          New Post
        </Link>
        <Link
          href="/admin/settings"
          className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Settings size={16} />
          Site Settings
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {cards.map(({ label, value, sub, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-5 flex items-start gap-4 transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
              <Icon size={20} className={color} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-sm font-medium text-slate-200 group-hover:text-amber-400 transition-colors">{label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent posts */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="font-semibold text-white text-sm">Recent Posts</h2>
          <Link href="/admin/posts" className="text-xs text-amber-500 hover:text-amber-400">
            View All →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-slate-500 text-sm px-5 py-8 text-center">No posts yet. <Link href="/admin/posts/new" className="text-amber-500 hover:underline">Create one →</Link></p>
        ) : (
          <ul className="divide-y divide-slate-800">
            {recent.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-800/50 group">
                <div className="min-w-0">
                  <p className="text-sm text-slate-200 truncate group-hover:text-white">{p.title}</p>
                  <p className="text-xs text-slate-500">{p.category} · {new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === "published" ? "bg-green-900/50 text-green-400" : "bg-slate-700 text-slate-400"}`}>
                    {p.status}
                  </span>
                  <Link href={`/admin/posts/${p.id}/edit`} className="text-xs text-amber-500 hover:text-amber-400">Edit</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
