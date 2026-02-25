"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAdminAuth } from "@/app/(admin)/admin/layout";
import { UploadCloud, Trash2, Copy, CheckCircle, Image as ImageIcon, Loader2 } from "lucide-react";

interface MediaItem {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  alt: string;
  url: string;
  created_at: string;
}

function fmt(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaAdmin() {
  const { pin } = useAdminAuth();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() =>
    fetch("/api/media", { headers: { "x-admin-pin": pin } })
      .then((r) => r.json())
      .then(setItems)
      .catch(() => {}),
  [pin]);

  useEffect(() => { if (pin) load(); }, [pin, load]);

  const upload = async (files: FileList | File[]) => {
    setUploading(true);
    setUploadError("");
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("alt", "");
      const res = await fetch("/api/media", { method: "POST", headers: { "x-admin-pin": pin }, body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({})) as { error?: string };
        setUploadError(j.error ?? "Upload failed");
      }
    }
    await load();
    setUploading(false);
  };

  const del = async (id: number) => {
    if (!confirm("Delete this image permanently?")) return;
    await fetch(`/api/media/${id}`, { method: "DELETE", headers: { "x-admin-pin": pin } });
    await load();
    if (selectedId === id) setSelectedId(null);
  };

  const copyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopied(item.id);
    setTimeout(() => setCopied(null), 1500);
  };

  const updateAlt = async (id: number, alt: string) => {
    await fetch(`/api/media/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-pin": pin },
      body: JSON.stringify({ alt }),
    });
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, alt } : i)));
  };

  const selected = items.find((i) => i.id === selectedId) ?? null;

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Media Library</h1>
          <p className="text-slate-400 text-sm mt-1">{items.length} files</p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
          {uploading ? "Uploading…" : "Upload Files"}
        </button>
        <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
          onChange={(e) => e.target.files && upload(e.target.files)} />
      </div>

      {/* Drag-drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); upload(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl py-8 text-center cursor-pointer transition-colors mb-6 ${
          dragging ? "border-amber-500 bg-amber-500/10" : "border-slate-700 hover:border-slate-500"
        }`}
      >
        <UploadCloud size={28} className="mx-auto text-slate-500 mb-2" />
        <p className="text-sm text-slate-500">Drag & drop images here, or click to browse</p>
        <p className="text-xs text-slate-600 mt-1">JPEG, PNG, WebP, GIF, SVG — max 10 MB each</p>
      </div>

      {uploadError && (
        <p className="text-xs text-red-400 mb-4">{uploadError}</p>
      )}

      <div className="flex gap-6">
        {/* Grid */}
        <div className="flex-1">
          {items.length === 0 ? (
            <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-xl">
              <ImageIcon size={40} className="mx-auto text-slate-600 mb-3" />
              <p className="text-slate-500 text-sm">No media uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(selectedId === item.id ? null : item.id)}
                  className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedId === item.id ? "border-amber-500" : "border-transparent hover:border-slate-600"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.alt || item.original_name}
                    className="w-full h-full object-cover bg-slate-800"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1">
                    <span className="text-xs text-white truncate w-full text-left">{item.original_name}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-60 shrink-0 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 self-start sticky top-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selected.url} alt={selected.alt} className="w-full rounded-lg bg-slate-800 object-cover" />
            <div>
              <p className="text-xs font-semibold text-slate-400 truncate">{selected.original_name}</p>
              <p className="text-xs text-slate-600 mt-0.5">{fmt(selected.size_bytes)} · {selected.mime_type.split("/")[1]?.toUpperCase()}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Alt Text</label>
              <input
                defaultValue={selected.alt}
                onBlur={(e) => updateAlt(selected.id, e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">URL</label>
              <div className="flex gap-1">
                <input readOnly value={selected.url} className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-400 font-mono truncate" />
                <button onClick={() => copyUrl(selected)} className="p-1.5 text-slate-400 hover:text-amber-400 transition-colors" title="Copy URL">
                  {copied === selected.id ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
            <button
              onClick={() => del(selected.id)}
              className="flex items-center gap-1.5 w-full justify-center text-xs text-red-400 hover:text-red-300 border border-red-900/50 hover:border-red-700 rounded-lg py-2 transition-colors"
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
