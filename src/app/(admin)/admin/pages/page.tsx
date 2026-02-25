"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/app/(admin)/admin/layout";
import { PlusCircle, FileText, Pencil, Trash2, Globe, Clock } from "lucide-react";

interface Page {
  id: number;
  title: string;
  slug: string;
  status: "draft" | "published";
  author: string;
  created_at: string;
  updated_at: string;
}

export default function PagesAdmin() {
  const { pin } = useAdminAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    fetch("/api/db/pages", { headers: { "x-admin-pin": pin } })
      .then((r) => r.json())
      .then((data) => { setPages(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));

  useEffect(() => { if (pin) load(); }, [pin]);

  const del = async (id: number, title: string) => {
    if (!confirm(`Delete page "${title}"?`)) return;
    await fetch(`/api/db/pages/${id}`, { method: "DELETE", headers: { "x-admin-pin": pin } });
    await load();
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Pages</h1>
          <p className="text-slate-400 text-sm mt-1">{pages.length} pages</p>
        </div>
        <Link
          href="/admin/pages/new"
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <PlusCircle size={16} /> New Page
        </Link>
      </div>

      {loading ? (
        <div className="text-slate-500 text-sm">Loading…</div>
      ) : pages.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-xl">
          <FileText size={40} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-500 text-sm">No pages yet.</p>
          <Link href="/admin/pages/new" className="text-amber-400 hover:underline text-sm mt-2 inline-block">
            Create your first page →
          </Link>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800">
          {pages.map((page) => (
            <div key={page.id} className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm truncate">{page.title}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      page.status === "published"
                        ? "bg-green-900/50 text-green-400"
                        : "bg-amber-900/50 text-amber-400"
                    }`}
                  >
                    {page.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-slate-500 font-mono">/{page.slug}</span>
                  <span className="text-xs text-slate-600 flex items-center gap-1">
                    <Clock size={11} /> {new Date(page.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {page.status === "published" && (
                  <a
                    href={`/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-500 hover:text-amber-400 transition-colors"
                    title="View on site"
                  >
                    <Globe size={15} />
                  </a>
                )}
                <Link
                  href={`/admin/pages/${page.id}/edit`}
                  className="p-2 text-slate-500 hover:text-white transition-colors"
                  title="Edit"
                >
                  <Pencil size={15} />
                </Link>
                <button
                  onClick={() => del(page.id, page.title)}
                  className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
