"use client";

import { useEffect, useState, useCallback } from "react";
import { useAdminAuth } from "@/app/(admin)/admin/layout";
import { MessageSquare, CheckCircle, XCircle, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

interface Comment {
  _id: string;
  post: string;
  authorName: string;
  authorEmail: string;
  content: string;
  status: "approved" | "pending" | "spam";
  createdAt: string;
}

interface CommentPage {
  data: Comment[];
  total: number;
  page: number;
  pages: number;
}

type StatusFilter = "all" | "pending" | "approved" | "spam";

const STATUS_COLORS: Record<string, string> = {
  approved: "bg-green-900/50 text-green-400",
  pending: "bg-amber-900/50 text-amber-400",
  spam: "bg-red-900/50 text-red-400",
};

export default function CommentsAdmin() {
  const { pin } = useAdminAuth();
  const [result, setResult] = useState<CommentPage | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [page, setPage] = useState(1);
  const [actioning, setActioning] = useState<string | null>(null);

  const load = useCallback((pageNum = page) => {
    if (!pin) return;
    const params = new URLSearchParams({ limit: "20", page: String(pageNum) });
    if (filter !== "all") params.set("status", filter);
    fetch(`/api/db/comments?${params}`, { headers: { "x-admin-pin": pin } })
      .then((r) => r.json())
      .then((d) => { if (d.data) setResult(d); })
      .catch(() => {});
  }, [pin, filter, page]);

  useEffect(() => { load(); }, [load]);

  // Reset to page 1 when filter changes (without triggering cascade)
  const handleFilterChange = (f: StatusFilter) => {
    setFilter(f);
    setPage(1);
  };

  const updateStatus = async (id: string, status: "approved" | "pending" | "spam") => {
    setActioning(id);
    await fetch(`/api/db/comments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-pin": pin },
      body: JSON.stringify({ status }),
    });
    await load();
    setActioning(null);
  };

  const deleteComment = async (id: string) => {
    if (!confirm("Delete this comment permanently?")) return;
    setActioning(id);
    await fetch(`/api/db/comments/${id}`, { method: "DELETE", headers: { "x-admin-pin": pin } });
    await load();
    setActioning(null);
  };

  const comments = result?.data ?? [];
  const total = result?.total ?? 0;
  const pages = result?.pages ?? 1;

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Comments</h1>
          <p className="text-slate-400 text-sm mt-1">{total} total</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-900 border border-slate-700 rounded-lg p-1 w-fit mb-5">
        {(["pending", "approved", "spam", "all"] as StatusFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => handleFilterChange(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded capitalize transition-colors ${
              filter === f ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <MessageSquare size={36} className="mb-3 opacity-40" />
            <p className="text-sm">No comments found.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {comments.map((c) => (
              <div key={c._id} className="px-5 py-4 hover:bg-slate-800/40 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-white text-sm">{c.authorName}</span>
                      <span className="text-slate-500 text-xs">{c.authorEmail}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[c.status] ?? "bg-slate-700 text-slate-400"}`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed line-clamp-3 mb-1">{c.content}</p>
                    <p className="text-xs text-slate-600">{new Date(c.createdAt).toLocaleString()}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {c.status !== "approved" && (
                      <button
                        onClick={() => updateStatus(c._id, "approved")}
                        disabled={actioning === c._id}
                        title="Approve"
                        className="p-1.5 text-slate-400 hover:text-green-400 transition-colors disabled:opacity-40"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                    {c.status !== "spam" && (
                      <button
                        onClick={() => updateStatus(c._id, "spam")}
                        disabled={actioning === c._id}
                        title="Mark as spam"
                        className="p-1.5 text-slate-400 hover:text-amber-400 transition-colors disabled:opacity-40"
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteComment(c._id)}
                      disabled={actioning === c._id}
                      title="Delete"
                      className="p-1.5 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-40"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-slate-400">
          <span>Page {page} of {pages}</span>
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
