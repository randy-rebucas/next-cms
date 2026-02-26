"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText, Layout, Image as ImageIcon, MessageSquare,
  PlusCircle, Settings, FolderOpen, Tag,
} from "lucide-react";
import { useAdminAuth } from "@/app/(admin)/admin/layout";

interface Stats {
  posts_total: number;
  posts_published: number;
  posts_draft: number;
  pages: number;
  media: number;
  categories: number;
  tags: number;
  comments_pending: number;
  comments_total: number;
}

interface Post {
  _id: string;
  title: string;
  status: string;
  author_name?: string;
  createdAt: string;
}

interface Comment {
  _id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export default function Dashboard() {
  const { pin } = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Post[]>([]);
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (!pin) return;
    (async () => {
      try {
        const h = { "x-admin-pin": pin };
        const [postsRes, pagesRes, mediaRes, catsRes, tagsRes, commentsAllRes, commentsPendingRes] =
          await Promise.all([
            fetch("/api/db/posts", { headers: h }).then((r) => r.json()),
            fetch("/api/db/pages", { headers: h }).then((r) => r.json()),
            fetch("/api/db/media", { headers: h }).then((r) => r.json()),
            fetch("/api/db/categories", { headers: h }).then((r) => r.json()),
            fetch("/api/db/tags", { headers: h }).then((r) => r.json()),
            fetch("/api/db/comments?limit=1", { headers: h }).then((r) => r.json()),
            fetch("/api/db/comments?status=pending&limit=5", { headers: h }).then((r) => r.json()),
          ]);

        const posts = Array.isArray(postsRes) ? postsRes : (postsRes.data ?? []);

        setStats({
          posts_total:      Array.isArray(postsRes) ? postsRes.length : (postsRes.total ?? 0),
          posts_published:  posts.filter((p: Post) => p.status === "published").length,
          posts_draft:      posts.filter((p: Post) => p.status === "draft").length,
          pages:            Array.isArray(pagesRes) ? pagesRes.length : (pagesRes.total ?? 0),
          media:            Array.isArray(mediaRes) ? mediaRes.length : 0,
          categories:       Array.isArray(catsRes)  ? catsRes.length  : 0,
          tags:             Array.isArray(tagsRes)   ? tagsRes.length   : 0,
          comments_total:   commentsAllRes.total     ?? 0,
          comments_pending: commentsPendingRes.total  ?? 0,
        });

        setRecent(posts.slice(0, 5));
        setPendingComments(
          Array.isArray(commentsPendingRes.data) ? commentsPendingRes.data : []
        );
      } catch {
        // leave stats null — cards stay in skeleton state
      }
    })();
  }, [pin]);

  const cards = stats
    ? [
        {
          label: "Posts", value: stats.posts_total,
          sub: `${stats.posts_published} published · ${stats.posts_draft} drafts`,
          icon: FileText, color: "text-amber-400", href: "/admin/posts",
        },
        {
          label: "Pages", value: stats.pages,
          sub: "CMS pages",
          icon: Layout, color: "text-cyan-400", href: "/admin/pages",
        },
        {
          label: "Media", value: stats.media,
          sub: "Uploaded files",
          icon: ImageIcon, color: "text-indigo-400", href: "/admin/media",
        },
        {
          label: "Comments", value: stats.comments_total,
          sub: `${stats.comments_pending} pending review`,
          icon: MessageSquare, color: "text-rose-400", href: "/admin/comments",
        },
        {
          label: "Categories", value: stats.categories,
          sub: "Content categories",
          icon: FolderOpen, color: "text-blue-400", href: "/admin/categories",
        },
        {
          label: "Tags", value: stats.tags,
          sub: "Content tags",
          icon: Tag, color: "text-purple-400", href: "/admin/tags",
        },
      ]
    : [];

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Welcome to nextCMS</p>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href="/admin/posts/new"
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <PlusCircle size={16} /> New Post
        </Link>
        <Link
          href="/admin/pages/new"
          className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Layout size={16} /> New Page
        </Link>
        <Link
          href="/admin/settings"
          className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Settings size={16} /> Site Settings
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {stats === null
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse">
                <div className="h-8 w-16 bg-slate-800 rounded mb-2" />
                <div className="h-4 w-24 bg-slate-800 rounded" />
              </div>
            ))
          : cards.map(({ label, value, sub, icon: Icon, color, href }) => (
              <Link
                key={label}
                href={href}
                className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-5 flex items-start gap-4 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                  <Icon size={20} className={color} />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="text-sm font-medium text-slate-200 group-hover:text-amber-400 transition-colors">{label}</div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate">{sub}</div>
                </div>
              </Link>
            ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent posts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <h2 className="font-semibold text-white text-sm">Recent Posts</h2>
            <Link href="/admin/posts" className="text-xs text-amber-500 hover:text-amber-400">View All →</Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-slate-500 text-sm px-5 py-8 text-center">
              No posts yet.{" "}
              <Link href="/admin/posts/new" className="text-amber-500 hover:underline">Create one →</Link>
            </p>
          ) : (
            <ul className="divide-y divide-slate-800">
              {recent.map((p) => (
                <li key={p._id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-800/50 group">
                  <div className="min-w-0">
                    <p className="text-sm text-slate-200 truncate group-hover:text-white">{p.title}</p>
                    <p className="text-xs text-slate-500">
                      {p.author_name || "—"} · {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.status === "published"
                        ? "bg-green-900/50 text-green-400"
                        : "bg-slate-700 text-slate-400"
                    }`}>
                      {p.status}
                    </span>
                    <Link href={`/admin/posts/${p._id}/edit`} className="text-xs text-amber-500 hover:text-amber-400">
                      Edit
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pending comments */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <h2 className="font-semibold text-white text-sm">
              Pending Comments
              {stats && stats.comments_pending > 0 && (
                <span className="ml-2 text-xs bg-rose-600 text-white px-1.5 py-0.5 rounded-full">
                  {stats.comments_pending}
                </span>
              )}
            </h2>
            <Link href="/admin/comments" className="text-xs text-amber-500 hover:text-amber-400">
              Moderate →
            </Link>
          </div>
          {pendingComments.length === 0 ? (
            <p className="text-slate-500 text-sm px-5 py-8 text-center">No pending comments.</p>
          ) : (
            <ul className="divide-y divide-slate-800">
              {pendingComments.map((c) => (
                <li key={c._id} className="px-5 py-3 hover:bg-slate-800/50">
                  <p className="text-sm font-medium text-slate-200">{c.authorName}</p>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{c.content}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{new Date(c.createdAt).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
