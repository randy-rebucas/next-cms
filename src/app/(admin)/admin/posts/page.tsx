"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { PlusCircle, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useAdminAuth } from "@/app/(admin)/admin/layout";

interface Post {
  _id: string;
  slug: string;
  title: string;
  status: string;
  author_name?: string;
  createdAt: string;
}

interface PostsResult {
  data: Post[];
  total: number;
  page: number;
  pages: number;
}

const LIMIT = 20;

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function PostsList() {
  const { pin } = useAdminAuth();
  const [result, setResult] = useState<PostsResult | null>(null);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!pin) return;
    const params = new URLSearchParams({ status: filter, page: String(page), limit: String(LIMIT) });
    if (search) params.set("q", search);
    fetch(`/api/db/posts?${params}`, { headers: { "x-admin-pin": pin } })
      .then((r) => r.json())
      .then((d: unknown) => {
        if (d && typeof d === "object" && "data" in d) {
          setResult(d as PostsResult);
        }
      })
      .catch(() => {});
  }, [pin, filter, page, search]);

  useEffect(() => { load(); }, [load]);

  const del = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    setDeleting(id);
    await fetch(`/api/db/posts/${id}`, { method: "DELETE", headers: { "x-admin-pin": pin } });
    await load();
    setDeleting(null);
  };

  const posts = result?.data ?? [];
  const total = result?.total ?? 0;
  const pages = result?.pages ?? 1;

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Posts</h1>
          <p className="text-slate-400 text-sm mt-1">{total} total</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <PlusCircle size={16} />
          New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-1 bg-slate-900 border border-slate-700 rounded-lg p-1">
          {(["all", "published", "draft"] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded capitalize transition-colors ${
                filter === f ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search posts…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {posts.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-12">
            No posts found.{" "}
            <Link href="/admin/posts/new" className="text-amber-500 hover:underline">
              Create one →
            </Link>
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs text-slate-500">
                <th className="px-5 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">Author</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {posts.map((p) => (
                <tr key={p._id} className="hover:bg-slate-800/50 group">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-200 group-hover:text-white line-clamp-1">{p.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">/{p.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-400 hidden sm:table-cell">{p.author_name || "Unknown"}</td>
                  <td className="px-4 py-3 text-slate-400 hidden md:table-cell">
                    {fmtDate(p.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.status === "published"
                          ? "bg-green-900/50 text-green-400"
                          : p.status === "draft"
                            ? "bg-slate-700 text-slate-400"
                            : "bg-yellow-900/50 text-yellow-400"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/admin/posts/${p._id}/edit`}
                        className="p-1.5 text-slate-400 hover:text-amber-400 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        onClick={() => del(p._id)}
                        disabled={deleting === p._id}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition-colors disabled:opacity-40"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-slate-400">
          <span>
            {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
