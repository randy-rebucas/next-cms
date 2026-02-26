"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Trash2, GripVertical, ExternalLink, ChevronDown,
  Loader2, Save, CheckCircle, XCircle, Navigation,
  Globe, FileText, Layout, FolderOpen,
} from "lucide-react";
import { useAdminAuth } from "../layout";
import type { IMenuItem, IMenu } from "@/models/Menu";

// ── Types ─────────────────────────────────────────────────────────────────────

// JSON-serialized versions of model types (_id is string from API responses)
type MenuItem = Omit<IMenuItem, "_id"> & { _id?: string };
type MenuDoc = Pick<IMenu, "name" | "location"> & { _id: string; items: MenuItem[] };

interface LinkOption { label: string; url: string; type: MenuItem["type"] }

// ── Fixed menu locations (like WordPress nav menu locations) ──────────────────

const LOCATIONS: { key: string; label: string; description: string }[] = [
  { key: "primary",  label: "Primary Navigation", description: "Main header menu" },
  { key: "footer",   label: "Footer Links",        description: "Links shown in site footer" },
  { key: "mobile",   label: "Mobile Menu",         description: "Mobile drawer navigation" },
];

const TYPE_ICONS: Record<string, React.ElementType> = {
  page: Layout, post: FileText, custom: Globe, category: FolderOpen,
};

// ── Item row ─────────────────────────────────────────────────────────────────

function ItemRow({
  item, index, total,
  onChange, onDelete, onMove,
}: {
  item: MenuItem; index: number; total: number;
  onChange: (i: number, next: MenuItem) => void;
  onDelete: (i: number) => void;
  onMove:   (i: number, dir: -1 | 1) => void;
}) {
  const TypeIcon = TYPE_ICONS[item.type] ?? Globe;

  return (
    <div className="flex items-start gap-2 bg-slate-800/60 border border-slate-700/60 rounded-lg p-3">
      {/* Drag handle (visual only — keyboard reorder via buttons) */}
      <GripVertical size={16} className="mt-2.5 text-slate-600 shrink-0 cursor-grab" />

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* Label */}
        <input
          value={item.label}
          onChange={(e) => onChange(index, { ...item, label: e.target.value })}
          placeholder="Label"
          className="bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
        {/* URL */}
        <div className="relative">
          <TypeIcon size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={item.url}
            onChange={(e) => onChange(index, { ...item, url: e.target.value })}
            placeholder="/path or https://…"
            className="w-full bg-slate-900 border border-slate-700 rounded-md pl-7 pr-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        {/* Type + Target */}
        <div className="flex gap-2">
          <select
            value={item.type}
            onChange={(e) => onChange(index, { ...item, type: e.target.value as MenuItem["type"] })}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="custom">Custom</option>
            <option value="page">Page</option>
            <option value="post">Post</option>
            <option value="category">Category</option>
          </select>
          <button
            title={item.target === "_blank" ? "Opens in new tab" : "Opens in same tab"}
            onClick={() => onChange(index, { ...item, target: item.target === "_blank" ? "_self" : "_blank" })}
            className={`px-2 rounded-md border text-xs transition-colors ${
              item.target === "_blank"
                ? "bg-amber-600/20 border-amber-600/40 text-amber-400"
                : "bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300"
            }`}
          >
            <ExternalLink size={12} />
          </button>
        </div>
      </div>

      {/* Move up / down / delete */}
      <div className="flex items-center gap-1 shrink-0 mt-0.5">
        <button
          onClick={() => onMove(index, -1)}
          disabled={index === 0}
          className="p-1 text-slate-500 hover:text-white disabled:opacity-30 transition-colors"
          title="Move up"
        >
          <ChevronDown size={15} className="rotate-180" />
        </button>
        <button
          onClick={() => onMove(index, 1)}
          disabled={index === total - 1}
          className="p-1 text-slate-500 hover:text-white disabled:opacity-30 transition-colors"
          title="Move down"
        >
          <ChevronDown size={15} />
        </button>
        <button
          onClick={() => onDelete(index)}
          className="p-1 text-slate-500 hover:text-red-400 transition-colors"
          title="Remove"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Add-link panel ────────────────────────────────────────────────────────────

function AddLinkPanel({ options, onAdd }: { options: LinkOption[]; onAdd: (item: MenuItem) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [tab, setTab] = useState<"existing" | "custom">("existing");

  const filtered = options.filter(
    (o) => o.label.toLowerCase().includes(search.toLowerCase()) || o.url.toLowerCase().includes(search.toLowerCase())
  );

  function addExisting(o: LinkOption) {
    onAdd({ label: o.label, type: o.type, url: o.url, target: "_self", order: 0 });
    setOpen(false); setSearch("");
  }

  function addCustom() {
    if (!customLabel.trim() || !customUrl.trim()) return;
    onAdd({ label: customLabel.trim(), type: "custom", url: customUrl.trim(), target: "_self", order: 0 });
    setCustomLabel(""); setCustomUrl(""); setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors border border-slate-700"
      >
        <Plus size={15} /> Add Item
        <ChevronDown size={13} className={`ml-1 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-10">
          <div className="flex border-b border-slate-800">
            {(["existing", "custom"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-xs font-semibold capitalize transition-colors ${
                  tab === t ? "text-amber-400 border-b-2 border-amber-500" : "text-slate-500 hover:text-white"
                }`}
              >
                {t === "existing" ? "Pages & Posts" : "Custom Link"}
              </button>
            ))}
          </div>

          {tab === "existing" ? (
            <div className="p-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                autoFocus
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 mb-2"
              />
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filtered.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-3">No results</p>
                )}
                {filtered.map((o) => {
                  const Icon = TYPE_ICONS[o.type] ?? Globe;
                  return (
                    <button
                      key={o.url}
                      onClick={() => addExisting(o)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-800 text-left transition-colors"
                    >
                      <Icon size={13} className="text-slate-500 shrink-0" />
                      <span className="text-sm text-slate-300 truncate">{o.label}</span>
                      <span className="text-xs text-slate-600 ml-auto shrink-0 truncate max-w-24">{o.url}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              <input
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="Label"
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <input
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="URL (e.g. /about or https://…)"
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={addCustom}
                disabled={!customLabel.trim() || !customUrl.trim()}
                className="w-full py-2 rounded-md bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors disabled:opacity-40"
              >
                Add to Menu
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MenusPage() {
  const { pin } = useAdminAuth();
  const headers = { "x-admin-pin": pin };

  const [menus, setMenus] = useState<Record<string, MenuDoc>>({});
  const [activeLocation, setActiveLocation] = useState(LOCATIONS[0].key);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [menuName, setMenuName] = useState("");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [linkOptions, setLinkOptions] = useState<LinkOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<"ok" | "err" | null>(null);

  // Load menus + link options
  const load = useCallback(async () => {
    if (!pin) return;
    setLoading(true);
    try {
      const [mRes, pRes, pgRes] = await Promise.all([
        fetch("/api/db/menus", { headers }),
        fetch("/api/db/posts?limit=100", { headers }),
        fetch("/api/db/pages?limit=100", { headers }),
      ]);
      const mJson = await mRes.json() as { data?: MenuDoc[] };
      const pJson = await pRes.json() as { data?: Array<{ slug?: string; title?: string }> | Array<{ slug?: string; title?: string }> };
      const pgJson = await pgRes.json() as { data?: Array<{ slug?: string; title?: string }> | Array<{ slug?: string; title?: string }> };

      // Index menus by location
      const map: Record<string, MenuDoc> = {};
      for (const m of mJson.data ?? []) map[m.location] = m;
      setMenus(map);

      // Build link options from posts + pages
      const rawPosts = Array.isArray(pJson.data)
        ? pJson.data
        : (pJson as unknown as Array<{ slug?: string; title?: string }>);
      const rawPages = Array.isArray(pgJson.data)
        ? pgJson.data
        : (pgJson as unknown as Array<{ slug?: string; title?: string }>);

      const opts: LinkOption[] = [
        ...(rawPosts ?? []).map((p) => ({ label: String(p.title ?? ""), url: `/blog/${p.slug ?? ""}`, type: "post" as const })),
        ...(rawPages ?? []).map((p) => ({ label: String(p.title ?? ""), url: `/${p.slug ?? ""}`, type: "page" as const })),
      ];
      setLinkOptions(opts);
    } finally {
      setLoading(false);
    }
  }, [pin]); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  // Sync editor state when active location changes
  useEffect(() => {
    const m = menus[activeLocation];
    if (m) {
      setItems([...m.items].sort((a, b) => a.order - b.order));
      setMenuName(m.name);
      setMenuId(m._id);
    } else {
      setItems([]);
      setMenuName(LOCATIONS.find((l) => l.key === activeLocation)?.label ?? "");
      setMenuId(null);
    }
    setSaveResult(null);
  }, [activeLocation, menus]);

  function handleChange(i: number, next: MenuItem) {
    setItems((prev) => prev.map((it, idx) => idx === i ? next : it));
    setSaveResult(null);
  }

  function handleDelete(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
    setSaveResult(null);
  }

  function handleMove(i: number, dir: -1 | 1) {
    const next = [...items];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
    setSaveResult(null);
  }

  function handleAdd(item: MenuItem) {
    setItems((prev) => [...prev, { ...item, order: prev.length }]);
    setSaveResult(null);
  }

  async function handleSave() {
    setSaving(true); setSaveResult(null);
    try {
      const ordered = items.map((it, idx) => ({ ...it, order: idx }));
      const url = menuId ? `/api/db/menus/${menuId}` : "/api/db/menus";
      const method = menuId ? "PUT" : "POST";
      const body = menuId
        ? { name: menuName, items: ordered }
        : { name: menuName, location: activeLocation, items: ordered };

      const r = await fetch(url, {
        method,
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json() as { data?: MenuDoc; error?: string };
      if (j.data) {
        setMenus((prev) => ({ ...prev, [activeLocation]: j.data! }));
        setMenuId(j.data._id);
        setSaveResult("ok");
        setTimeout(() => setSaveResult(null), 3000);
      } else {
        setSaveResult("err");
      }
    } catch {
      setSaveResult("err");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteMenu() {
    if (!menuId || !confirm("Delete this menu?")) return;
    await fetch(`/api/db/menus/${menuId}`, { method: "DELETE", headers });
    setMenus((prev) => { const next = { ...prev }; delete next[activeLocation]; return next; });
    setMenuId(null); setItems([]); setSaveResult(null);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400 p-8">
        <Loader2 size={20} className="animate-spin" /> Loading menus…
      </div>
    );
  }

  const currentLocation = LOCATIONS.find((l) => l.key === activeLocation);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Menus</h1>
        <p className="text-slate-400 text-sm mt-1">
          Build navigation menus for your site. Select a location and configure its links.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">

        {/* ── Location Picker ──────────────────────────────────────────── */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Menu Locations</p>
          </div>
          <nav className="p-2 space-y-1">
            {LOCATIONS.map((loc) => {
              const exists = !!menus[loc.key];
              return (
                <button
                  key={loc.key}
                  onClick={() => setActiveLocation(loc.key)}
                  className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    activeLocation === loc.key
                      ? "bg-amber-600/15 text-amber-400"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Navigation size={15} className="mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{loc.label}</p>
                    <p className="text-xs text-slate-500">{loc.description}</p>
                  </div>
                  {exists && (
                    <span className="ml-auto shrink-0 text-[10px] bg-emerald-900/40 text-emerald-400 border border-emerald-800/40 px-1.5 py-0.5 rounded-full">
                      {menus[loc.key].items.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ── Editor ───────────────────────────────────────────────────── */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800">
            <Navigation size={17} className="text-amber-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <input
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                className="bg-transparent text-white font-semibold text-sm w-full focus:outline-none"
                placeholder="Menu name…"
              />
              <p className="text-xs text-slate-500">{currentLocation?.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {saveResult === "ok" && <CheckCircle size={16} className="text-emerald-400" />}
              {saveResult === "err" && <XCircle size={16} className="text-red-400" />}
              {menuId && (
                <button
                  onClick={handleDeleteMenu}
                  className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                  title="Delete menu"
                >
                  <Trash2 size={15} />
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Menu
              </button>
            </div>
          </div>

          {/* Items */}
          <div className="p-5 space-y-3">
            {items.length === 0 && (
              <div className="text-center py-10 text-slate-600">
                <Navigation size={28} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No items yet. Add links below.</p>
              </div>
            )}
            {items.map((item, i) => (
              <ItemRow
                key={item._id ?? i}
                item={item}
                index={i}
                total={items.length}
                onChange={handleChange}
                onDelete={handleDelete}
                onMove={handleMove}
              />
            ))}

            {/* Add controls */}
            <div className="pt-2 flex items-center gap-3 flex-wrap">
              <AddLinkPanel options={linkOptions} onAdd={handleAdd} />
              <p className="text-xs text-slate-600">
                {items.length} item{items.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Column headers (visible when items exist) */}
          {items.length > 0 && (
            <div className="px-5 pb-3 hidden sm:grid grid-cols-3 gap-2 text-[10px] text-slate-600 uppercase tracking-widest">
              <span className="pl-6">Label</span>
              <span>URL</span>
              <span>Type / Target</span>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-600 text-center">
        Menus are stored in the database and consumed by theme templates via the Navigation API.
      </p>
    </div>
  );
}
