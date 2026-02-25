"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Pencil, Trash2, Search } from "lucide-react";

interface Post {
  id: number;
  slug: string;
  title: string;
  status: string;
  category: string;
  author: string;
  created_at: string;
}

export default function PostsList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);

  const pin = typeof window !== "undefined" ? sessionStorage.getItem("adminPin") ?? "" : "";

  const load = () =>
    fetch(`/api/db/posts?status=${filter}`, { headers: { "x-admin-pin": pin } })
      .then((r) => r.json())
      .then(setPosts);

  useEffect(() => { load(); }, [filter]);

  const del = async (id: number) => {
    if (!confirm("Delete this post?")) return;
    setDeleting(id);
    await fetch(`/api/db/posts/${id}`, { method: "DELETE", headers: { "x-admin-pin": pin } });
    await load();
    setDeleting(null);
  };

  const visible = posts.filter((p) =>
    search ? p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Posts</h1>
          <p className="text-slate-400 text-sm mt-1">{posts.length} total</p>
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
              onClick={() => setFilter(f)}
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
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {visible.length === 0 ? (
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
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {visible.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/50 group">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-200 group-hover:text-white line-clamp-1">{p.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">/{p.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-400 hidden sm:table-cell">{p.category || "—"}</td>
                  <td className="px-4 py-3 text-slate-400 hidden md:table-cell">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.status === "published"
                          ? "bg-green-900/50 text-green-400"
                          : "bg-slate-700 text-slate-400"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/admin/posts/${p.id}/edit`}
                        className="p-1.5 text-slate-400 hover:text-amber-400 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        onClick={() => del(p.id)}
                        disabled={deleting === p.id}
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
    </div>
  );
}
