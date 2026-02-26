"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Save, Eye, EyeOff, Sparkles, ArrowLeft, Loader2, Link2, X, History } from "lucide-react";
import Link from "next/link";
import { useAdminAuth } from "@/app/(admin)/admin/layout";
import BlockEditor from "@/components/admin/BlockEditor";

interface Revision {
  _id: string;
  revisionNumber: number;
  title: string;
  status: string;
  savedBy?: string;
  createdAt: string;
}

interface PostData {
  _id?: string;
  id?: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: "draft" | "published";
  category: string;
  author: string;
  read_time: string;
  tag_css: string;
  featured_image: string;
  meta_title: string;
  meta_description: string;
  og_image: string;
}

interface Taxonomy { id: number; name: string; slug: string; }


const DEFAULT_TAG_OPTIONS = [
  { label: "Amber", value: "bg-amber-100 text-amber-700" },
  { label: "Blue", value: "bg-blue-100 text-blue-700" },
  { label: "Red", value: "bg-red-100 text-red-700" },
  { label: "Green", value: "bg-green-100 text-green-700" },
  { label: "Purple", value: "bg-purple-100 text-purple-700" },
  { label: "Slate", value: "bg-slate-100 text-slate-600" },
];

export default function PostEditor({ initial }: { initial?: Partial<PostData> }) {
  const router = useRouter();
  const { pin } = useAdminAuth();

  const [data, setData] = useState<PostData>({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    content: initial?.content ?? "",
    excerpt: initial?.excerpt ?? "",
    status: initial?.status ?? "draft",
    category: initial?.category ?? "",
    author: initial?.author ?? "Atty. Levi Baligod",
    read_time: initial?.read_time ?? "5 min read",
    tag_css: initial?.tag_css ?? "bg-slate-100 text-slate-600",
    featured_image: initial?.featured_image ?? "",
    meta_title: initial?.meta_title ?? "",
    meta_description: initial?.meta_description ?? "",
    og_image: initial?.og_image ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [toast, setToast] = useState("");
  const [seoOpen, setSeoOpen] = useState(false);
  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [categories, setCategories] = useState<Taxonomy[]>([]);
  const [allTags, setAllTags] = useState<Taxonomy[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [revisionsOpen, setRevisionsOpen] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  const postId = initial?._id;


  useEffect(() => {
    fetch("/api/db/categories").then((r) => r.json()).then(setCategories).catch(() => {});
    fetch("/api/db/tags").then((r) => r.json()).then(setAllTags).catch(() => {});
  }, []);

  const loadRevisions = useCallback(async () => {
    if (!postId || !pin) return;
    const res = await fetch(`/api/db/posts/${postId}/revisions`, {
      headers: { "x-admin-pin": pin },
    });
    if (res.ok) {
      const data = await res.json();
      setRevisions(Array.isArray(data) ? data : []);
    }
  }, [postId, pin]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (postId) loadRevisions(); }, [postId, loadRevisions]);

  const restoreRevision = async (revId: string) => {
    if (!postId || !confirm("Restore this revision? The current content will be saved as a new revision first.")) return;
    setRestoring(revId);
    const res = await fetch(`/api/db/posts/${postId}/revisions/${revId}/restore`, {
      method: "POST",
      headers: { "x-admin-pin": pin },
    });
    if (res.ok) {
      setToast("Revision restored");
      setTimeout(() => setToast(""), 3000);
      window.location.reload();
    } else {
      setToast("Failed to restore revision");
      setTimeout(() => setToast(""), 3000);
      setRestoring(null);
    }
  };

  const set = <K extends keyof PostData>(key: K, val: PostData[K]) =>
    setData((d) => ({ ...d, [key]: val }));

  const autoSlug = (t: string) =>
    t.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);

  const toggleTag = (id: number) =>
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const generatePreview = async () => {
    if (!initial?.id) { setToast("Save the post first"); return; }
    setGeneratingPreview(true);
    const res = await fetch(`/api/db/posts/${initial.id}/preview-token`, {
      method: "POST",
      headers: { "x-admin-pin": pin },
    });
    if (res.ok) {
      const json = await res.json() as { url: string };
      window.open(json.url, "_blank");
    } else {
      setToast("Preview failed");
    }
    setGeneratingPreview(false);
  };

  const save = async (status?: "draft" | "published") => {
    setSaving(true);
    const payload = { ...data, status: status ?? data.status, tag_ids: selectedTagIds };
    const isNew = !initial?.id;
    const url = isNew ? "/api/db/posts" : `/api/db/posts/${initial!.id}`;
    const method = isNew ? "POST" : "PUT";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", "x-admin-pin": pin },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const saved = await res.json();
      setToast("Saved ✓");
      setTimeout(() => setToast(""), 3000);
      if (isNew) router.push(`/admin/posts/${saved.id}/edit`);
      else set("status", saved.status);
    } else {
      setToast("Error saving");
    }
    setSaving(false);
  };

  const generateWithAI = async (type: "post" | "excerpt") => {
    if (!data.title) { setAiError("Enter a title first"); return; }
    setAiLoading(true);
    setAiError("");
    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-pin": pin },
      body: JSON.stringify({ title: data.title, type }),
    });
    const json = await res.json();
    if (res.ok) {
      if (type === "post") set("content", json.content);
      else set("excerpt", json.content);
    } else {
      setAiError(json.error ?? "AI generation failed");
    }
    setAiLoading(false);
  };

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/posts" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">{initial?.id ? "Edit Post" : "New Post"}</h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Status:{" "}
              <span className={data.status === "published" ? "text-green-400" : "text-amber-400"}>
                {data.status}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {toast && (
            <span className="text-xs text-green-400 font-medium">{toast}</span>
          )}
          {initial?.id && (
            <button
              onClick={generatePreview}
              disabled={generatingPreview}
              title="Open draft preview in new tab"
              className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {generatingPreview ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
              Preview
            </button>
          )}
          <button
            onClick={() => save("draft")}
            disabled={saving}
            className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Draft
          </button>
          <button
            onClick={() => save("published")}
            disabled={saving}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {data.status === "published" ? <Eye size={14} /> : <EyeOff size={14} />}
            {data.status === "published" ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_260px] gap-6">
        {/* Main editor */}
        <div className="space-y-4">
          {/* Title */}
          <input
            type="text"
            placeholder="Post title…"
            value={data.title}
            onChange={(e) => {
              set("title", e.target.value);
              if (!initial?.id) set("slug", autoSlug(e.target.value));
            }}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xl font-bold text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
          />

          {/* AI actions */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => generateWithAI("post")}
              disabled={aiLoading}
              className="flex items-center gap-1.5 bg-violet-700 hover:bg-violet-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              Generate Post with AI
            </button>
            <button
              type="button"
              onClick={() => generateWithAI("excerpt")}
              disabled={aiLoading}
              className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <Sparkles size={12} />
              Generate Excerpt
            </button>
            {aiError && <span className="text-xs text-red-400 self-center">{aiError}</span>}
          </div>

          {/* Block editor */}
          <BlockEditor
            value={data.content}
            onChange={(val) => set("content", val)}
            placeholder="Write your post content here, or use Generate with AI above…"
          />

          {/* Excerpt */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Excerpt</label>
            <textarea
              rows={3}
              value={data.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              placeholder="Short summary shown on cards and search results…"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* SEO Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setSeoOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-300 hover:text-white"
            >
              SEO Settings
              <span className="text-xs text-slate-600">{seoOpen ? "▲" : "▼"}</span>
            </button>
            {seoOpen && (
              <div className="px-4 pb-4 space-y-3 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Meta Title</label>
                  <input
                    type="text"
                    value={data.meta_title}
                    onChange={(e) => set("meta_title", e.target.value)}
                    placeholder={`${data.title} | Baligod Law Office`}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-xs text-slate-600 mt-1">{data.meta_title.length}/60 chars</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Meta Description</label>
                  <textarea
                    rows={2}
                    value={data.meta_description}
                    onChange={(e) => set("meta_description", e.target.value)}
                    placeholder="Describe this post for search engines…"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 resize-none"
                  />
                  <p className="text-xs text-slate-600 mt-1">{data.meta_description.length}/160 chars</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">OG Image URL</label>
                  <input
                    type="text"
                    value={data.og_image}
                    onChange={(e) => set("og_image", e.target.value)}
                    placeholder="/uploads/2024/01/og.jpg"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar metadata */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Post Details</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
              <select
                value={data.status}
                onChange={(e) => set("status", e.target.value as "draft" | "published")}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Slug / URL</label>
              <input
                type="text"
                value={data.slug}
                onChange={(e) => set("slug", e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500"
              />
              <p className="text-xs text-slate-600 mt-1">/blog/{data.slug || "…"}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
              {categories.length > 0 ? (
                <select
                  value={data.category}
                  onChange={(e) => set("category", e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="">— None —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={data.category}
                  onChange={(e) => set("category", e.target.value)}
                  placeholder="e.g. Anti-Corruption"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                />
              )}
            </div>

            {allTags.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map((tag) => {
                    const active = selectedTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                          active
                            ? "bg-amber-600 border-amber-500 text-white"
                            : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"
                        }`}
                      >
                        {active && <X size={9} className="inline mr-0.5" />}
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Featured Image URL</label>
              <input
                type="text"
                value={data.featured_image}
                onChange={(e) => set("featured_image", e.target.value)}
                placeholder="/uploads/2024/01/banner.jpg"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              />
              {data.featured_image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.featured_image} alt="" className="mt-2 rounded-lg w-full object-cover max-h-24 bg-slate-800" />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Author</label>
              <input
                type="text"
                value={data.author}
                onChange={(e) => set("author", e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Read Time</label>
              <input
                type="text"
                value={data.read_time}
                onChange={(e) => set("read_time", e.target.value)}
                placeholder="5 min read"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Tag Color</label>
              <select
                value={data.tag_css}
                onChange={(e) => set("tag_css", e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              >
                {DEFAULT_TAG_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className={`mt-2 inline-flex text-xs font-semibold px-2 py-0.5 rounded-full ${data.tag_css}`}>
                {data.category || "Category"}
              </div>
            </div>
          </div>

          {/* View on site */}
          {data.slug && initial?.id && (
            <a
              href={`/blog/${data.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full border border-slate-700 hover:border-amber-500 text-slate-400 hover:text-amber-400 text-sm py-2.5 rounded-xl transition-colors"
            >
              View on Site →
            </a>
          )}

          {/* Revisions */}
          {postId && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setRevisionsOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-300 hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <History size={14} />
                  Revisions
                  {revisions.length > 0 && (
                    <span className="text-xs text-slate-500 font-normal">({revisions.length})</span>
                  )}
                </span>
                <span className="text-xs text-slate-600">{revisionsOpen ? "▲" : "▼"}</span>
              </button>
              {revisionsOpen && (
                <div className="border-t border-slate-800 max-h-64 overflow-y-auto">
                  {revisions.length === 0 ? (
                    <p className="text-xs text-slate-500 px-4 py-3 text-center">No revisions yet.</p>
                  ) : (
                    <ul className="divide-y divide-slate-800">
                      {revisions.map((rev) => (
                        <li key={rev._id} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-800/50 gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-300">#{rev.revisionNumber} — {rev.title.slice(0, 28)}{rev.title.length > 28 ? "…" : ""}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(rev.createdAt).toLocaleString()} · {rev.savedBy || "—"}
                            </p>
                          </div>
                          <button
                            onClick={() => restoreRevision(rev._id)}
                            disabled={restoring === rev._id}
                            className="shrink-0 text-xs text-amber-500 hover:text-amber-400 disabled:opacity-40 transition-colors"
                          >
                            {restoring === rev._id ? <Loader2 size={12} className="animate-spin" /> : "Restore"}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
