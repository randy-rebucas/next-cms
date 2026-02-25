"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Save, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const TipTapEditor = dynamic(() => import("@/components/admin/TipTapEditor"), { ssr: false });

interface PageData {
  id?: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: "draft" | "published";
  author: string;
  featured_image: string;
  meta_title: string;
  meta_description: string;
  og_image: string;
}

export default function PageEditor({ initial }: { initial?: Partial<PageData> }) {
  const router = useRouter();
  const pin = typeof window !== "undefined" ? sessionStorage.getItem("adminPin") ?? "" : "";

  const [data, setData] = useState<PageData>({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    content: initial?.content ?? "",
    excerpt: initial?.excerpt ?? "",
    status: initial?.status ?? "draft",
    author: initial?.author ?? "Atty. Levi Baligod",
    featured_image: initial?.featured_image ?? "",
    meta_title: initial?.meta_title ?? "",
    meta_description: initial?.meta_description ?? "",
    og_image: initial?.og_image ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [seoOpen, setSeoOpen] = useState(false);

  const set = <K extends keyof PageData>(key: K, val: PageData[K]) =>
    setData((d) => ({ ...d, [key]: val }));

  const autoSlug = (t: string) =>
    t.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);

  const save = async (status?: "draft" | "published") => {
    setSaving(true);
    const payload = { ...data, status: status ?? data.status };
    const isNew = !initial?.id;
    const url = isNew ? "/api/db/pages" : `/api/db/pages/${initial!.id}`;
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
      if (isNew) router.push(`/admin/pages/${(saved as { id: number }).id}/edit`);
      else set("status", saved.status);
    } else {
      setToast("Error saving");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/pages" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">{initial?.id ? "Edit Page" : "New Page"}</h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Status:{" "}
              <span className={data.status === "published" ? "text-green-400" : "text-amber-400"}>
                {data.status}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {toast && <span className="text-xs text-green-400 font-medium">{toast}</span>}
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
          <input
            type="text"
            placeholder="Page title…"
            value={data.title}
            onChange={(e) => {
              set("title", e.target.value);
              if (!initial?.id) set("slug", autoSlug(e.target.value));
            }}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xl font-bold text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
          />

          <TipTapEditor
            content={data.content}
            onChange={(html) => set("content", html)}
            placeholder="Write your page content here…"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Excerpt / Summary</label>
            <textarea
              rows={3}
              value={data.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              placeholder="Optional short description…"
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
                    placeholder="Describe this page for search engines…"
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
                    placeholder="/uploads/2024/01/og-image.jpg"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Page Details</h3>

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
              <p className="text-xs text-slate-600 mt-1">/{data.slug || "…"}</p>
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
              <label className="block text-xs font-semibold text-slate-500 mb-1">Featured Image URL</label>
              <input
                type="text"
                value={data.featured_image}
                onChange={(e) => set("featured_image", e.target.value)}
                placeholder="/uploads/2024/01/hero.jpg"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              />
              {data.featured_image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.featured_image} alt="" className="mt-2 rounded-lg w-full object-cover max-h-24 bg-slate-800" />
              )}
            </div>
          </div>

          {data.slug && initial?.id && (
            <a
              href={`/${data.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full border border-slate-700 hover:border-amber-500 text-slate-400 hover:text-amber-400 text-sm py-2.5 rounded-xl transition-colors"
            >
              View on Site →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
