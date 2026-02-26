"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/app/(admin)/admin/layout";
import { PlusCircle, FileText, Pencil, Trash2, Globe, Clock, ChevronLeft, ChevronRight } from "lucide-react";

interface Page {
  _id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  author?: string;
  createdAt: string;
  updatedAt: string;
}

interface PagesResult {
  data: Page[];
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

export default function PagesAdmin() {
  const { pin } = useAdminAuth();
  const [result, setResult] = useState<PagesResult | null>(null);
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!pin) return;
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    fetch(`/api/db/pages?${params}`, { headers: { "x-admin-pin": pin } })
      .then((r) => r.json())
      .then((data: unknown) => {
        if (data && typeof data === "object" && "data" in data) {
          setResult(data as PagesResult);
        }
      })
      .catch(() => {});
  }, [pin, page]);

  useEffect(() => { load(); }, [load]);

  const del = async (id: string, title: string) => {
    if (!confirm(`Delete page "${title}"?`)) return;
    setDeleting(id);
    await fetch(`/api/db/pages/${id}`, { method: "DELETE", headers: { "x-admin-pin": pin } });
    await load();
    setDeleting(null);
  };

  const pages = result?.data ?? [];
  const total = result?.total ?? 0;
  const totalPages = result?.pages ?? 1;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Pages</h1>
          <p className="text-slate-400 text-sm mt-1">{total} pages</p>
        </div>
        <Link
          href="/admin/pages/new"
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <PlusCircle size={16} /> New Page
        </Link>
      </div>

      {pages.length === 0 && result !== null ? (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-xl">
          <FileText size={40} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-500 text-sm">No pages yet.</p>
          <Link href="/admin/pages/new" className="text-amber-400 hover:underline text-sm mt-2 inline-block">
            Create your first page →
          </Link>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800">
          {pages.map((pg) => (
            <div key={pg._id} className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm truncate">{pg.title}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      pg.status === "published"
                        ? "bg-green-900/50 text-green-400"
                        : "bg-amber-900/50 text-amber-400"
                    }`}
                  >
                    {pg.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-slate-500 font-mono">/{pg.slug}</span>
                  <span className="text-xs text-slate-600 flex items-center gap-1">
                    <Clock size={11} /> {fmtDate(pg.updatedAt ?? pg.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {pg.status === "published" && (
                  <a
                    href={`/${pg.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-500 hover:text-amber-400 transition-colors"
                    title="View on site"
                  >
                    <Globe size={15} />
                  </a>
                )}
                <Link
                  href={`/admin/pages/${pg._id}/edit`}
                  className="p-2 text-slate-500 hover:text-white transition-colors"
                  title="Edit"
                >
                  <Pencil size={15} />
                </Link>
                <button
                  onClick={() => del(pg._id, pg.title)}
                  disabled={deleting === pg._id}
                  className="p-2 text-slate-500 hover:text-red-400 transition-colors disabled:opacity-40"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
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
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
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
