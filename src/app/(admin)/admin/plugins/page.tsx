"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAdminAuth } from "@/app/(admin)/admin/layout";
import {
  Loader2, Search, Upload, X, Check, AlertCircle, Package, Trash2,
} from "lucide-react";
import { PLUGIN_REGISTRY, DEFAULT_ENABLED, type PluginDef } from "@/core/plugins";

// ── Extended plugin def (built-in + custom uploads) ───────────────────────────

interface PluginEntry extends PluginDef {
  version?: string;
  author?: string;
  custom?: boolean;
}

type FilterTab = "all" | "active" | "inactive" | "section" | "tool";

// ── Helpers ───────────────────────────────────────────────────────────────────

const CATEGORY_LABEL: Record<PluginDef["category"], string> = {
  section: "Section",
  tool: "Tool",
};

const SAMPLE_MANIFEST = `{
  "id": "my-plugin",
  "label": "My Plugin",
  "description": "What this plugin does",
  "version": "1.0.0",
  "author": "Your Name",
  "category": "tool",
  "icon": "🔌"
}`;

// ── Main Component ────────────────────────────────────────────────────────────

export default function PluginsAdmin() {
  const { pin } = useAdminAuth();

  const [enabled, setEnabled] = useState<Set<string>>(new Set(DEFAULT_ENABLED));
  const [customPlugins, setCustomPlugins] = useState<PluginEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  const [uploadOpen, setUploadOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = useCallback((msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ── Load settings ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!pin) return;
    fetch("/api/db/settings", { headers: { "x-admin-pin": pin } })
      .then((r) => r.json())
      .then((data: Record<string, unknown>) => {
        if (Array.isArray(data.enabledPlugins)) {
          setEnabled(new Set(data.enabledPlugins as string[]));
        }
        if (Array.isArray(data.customPlugins)) {
          setCustomPlugins(data.customPlugins as PluginEntry[]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pin]);

  // ── Save helper ───────────────────────────────────────────────────────────

  const saveSettings = useCallback(async (
    nextEnabled: Set<string>,
    nextCustom?: PluginEntry[]
  ) => {
    const body: Record<string, unknown> = { enabledPlugins: [...nextEnabled] };
    if (nextCustom !== undefined) body.customPlugins = nextCustom;
    const res = await fetch("/api/db/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-pin": pin },
      body: JSON.stringify(body),
    });
    return res.ok;
  }, [pin]);

  // ── Per-plugin toggle (immediate) ─────────────────────────────────────────

  const togglePlugin = useCallback(async (pluginId: string, label: string) => {
    const wasActive = enabled.has(pluginId);
    const next = new Set(enabled);
    if (wasActive) next.delete(pluginId); else next.add(pluginId);

    setActivating(pluginId);
    setEnabled(next); // optimistic update

    const ok = await saveSettings(next);
    if (ok) {
      showToast(`"${label}" ${wasActive ? "deactivated" : "activated"}`);
    } else {
      setEnabled(enabled); // rollback
      showToast(`Failed to update "${label}"`, "err");
    }
    setActivating(null);
  }, [enabled, saveSettings, showToast]);

  // ── Bulk actions ──────────────────────────────────────────────────────────

  const allIds = useMemo(() => [
    ...PLUGIN_REGISTRY.map((p) => p.id),
    ...customPlugins.map((p) => p.id),
  ], [customPlugins]);

  const activateAll = useCallback(async () => {
    const next = new Set(allIds);
    setEnabled(next);
    const ok = await saveSettings(next);
    if (ok) showToast("All plugins activated");
    else { setEnabled(enabled); showToast("Failed to update", "err"); }
  }, [allIds, enabled, saveSettings, showToast]);

  const deactivateAll = useCallback(async () => {
    const next = new Set<string>();
    setEnabled(next);
    const ok = await saveSettings(next);
    if (ok) showToast("All plugins deactivated");
    else { setEnabled(enabled); showToast("Failed to update", "err"); }
  }, [enabled, saveSettings, showToast]);

  // ── Delete custom plugin ──────────────────────────────────────────────────

  const deletePlugin = useCallback(async (pluginId: string, label: string) => {
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return;
    setDeleting(pluginId);

    const nextCustom = customPlugins.filter((p) => p.id !== pluginId);
    const nextEnabled = new Set(enabled);
    nextEnabled.delete(pluginId);

    setCustomPlugins(nextCustom);
    setEnabled(nextEnabled);

    const ok = await saveSettings(nextEnabled, nextCustom);
    if (ok) showToast(`"${label}" deleted`);
    else {
      setCustomPlugins(customPlugins);
      setEnabled(enabled);
      showToast("Failed to delete plugin", "err");
    }
    setDeleting(null);
  }, [customPlugins, enabled, saveSettings, showToast]);

  // ── Upload ────────────────────────────────────────────────────────────────

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.name.endsWith(".json")) {
      showToast("Only .json plugin manifest files are supported", "err");
      return;
    }
    setUploading(true);
    try {
      const text = await file.text();
      const manifest = JSON.parse(text) as Partial<PluginEntry>;

      if (!manifest.id || !manifest.label) {
        showToast("Invalid manifest: must include 'id' and 'label'", "err");
        setUploading(false);
        return;
      }
      if (!/^[a-z0-9-]+$/.test(manifest.id)) {
        showToast("Plugin id must be lowercase letters, numbers, and hyphens only", "err");
        setUploading(false);
        return;
      }
      const allKnown = [...PLUGIN_REGISTRY, ...customPlugins];
      if (allKnown.some((p) => p.id === manifest.id)) {
        showToast(`Plugin '${manifest.id}' is already installed`, "err");
        setUploading(false);
        return;
      }

      const newPlugin: PluginEntry = {
        id: manifest.id,
        label: manifest.label,
        description: manifest.description || "",
        icon: manifest.icon || "🔌",
        category: manifest.category === "section" ? "section" : "tool",
        defaultEnabled: false,
        version: manifest.version || "1.0.0",
        author: manifest.author || "",
        custom: true,
      };

      const nextCustom = [...customPlugins, newPlugin];
      setCustomPlugins(nextCustom);

      const ok = await saveSettings(enabled, nextCustom);
      if (ok) {
        showToast(`"${newPlugin.label}" installed!`);
        setUploadOpen(false);
      } else {
        setCustomPlugins(customPlugins);
        showToast("Failed to install plugin", "err");
      }
    } catch {
      showToast("Failed to parse plugin manifest", "err");
    }
    setUploading(false);
  }, [customPlugins, enabled, saveSettings, showToast]);

  // ── Merged + filtered list ────────────────────────────────────────────────

  const allPlugins: PluginEntry[] = useMemo(() => [
    ...PLUGIN_REGISTRY,
    ...customPlugins,
  ], [customPlugins]);

  const filtered = useMemo(() => {
    let list = allPlugins;
    if (filter === "active")   list = list.filter((p) => enabled.has(p.id));
    if (filter === "inactive") list = list.filter((p) => !enabled.has(p.id));
    if (filter === "section")  list = list.filter((p) => p.category === "section");
    if (filter === "tool")     list = list.filter((p) => p.category === "tool");
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.label.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allPlugins, filter, search, enabled]);

  const activeCount = useMemo(
    () => allPlugins.filter((p) => enabled.has(p.id)).length,
    [allPlugins, enabled]
  );

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="text-slate-400 text-sm flex items-center gap-2">
        <Loader2 size={14} className="animate-spin" /> Loading plugins…
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Fixed toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 border text-sm px-4 py-2.5 rounded-xl shadow-xl ${
          toast.type === "err"
            ? "bg-slate-800 border-red-700 text-red-400"
            : "bg-slate-800 border-slate-700 text-green-400"
        }`}>
          {toast.type === "err" ? <AlertCircle size={14} /> : <Check size={14} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Plugins</h1>
          <p className="text-slate-400 text-sm mt-1">
            {activeCount} of {allPlugins.length} plugins active
          </p>
        </div>
        <button
          onClick={() => setUploadOpen((v) => !v)}
          className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Upload size={14} /> Add New Plugin
        </button>
      </div>

      {/* Upload Panel */}
      {uploadOpen && (
        <div className="mb-6 bg-slate-900 border border-amber-800/40 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Upload size={14} className="text-amber-400" /> Install Plugin
            </h2>
            <button onClick={() => setUploadOpen(false)} className="text-slate-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="p-5 grid lg:grid-cols-2 gap-5">
            <div>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file) handleFileUpload(file);
                }}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  dragOver ? "border-amber-500 bg-amber-950/20" : "border-slate-700 hover:border-amber-600/50"
                }`}
              >
                {uploading ? (
                  <Loader2 size={28} className="mx-auto text-amber-500 mb-3 animate-spin" />
                ) : (
                  <Package size={28} className="mx-auto text-slate-500 mb-3" />
                )}
                <p className="text-sm font-medium text-slate-300">
                  {uploading ? "Installing…" : "Drop plugin.json here or click to browse"}
                </p>
                <p className="text-xs text-slate-500 mt-1">Accepts .json plugin manifest files</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUpload(f);
                  e.target.value = "";
                }}
              />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2">Plugin manifest format (plugin.json)</p>
              <pre className="text-xs text-slate-400 font-mono bg-slate-800 rounded-xl p-4 overflow-x-auto leading-relaxed">
                {SAMPLE_MANIFEST}
              </pre>
              <p className="text-xs text-slate-500 mt-3">
                Custom plugins are stored as feature flags. Hook registrations require a server deployment to take effect.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter + Search */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-1 bg-slate-900 border border-slate-700 rounded-lg p-1">
          {(["all", "active", "inactive", "section", "tool"] as FilterTab[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded capitalize transition-colors whitespace-nowrap ${
                filter === f ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {f}
              {f === "active" && <span className="ml-1 opacity-70">({activeCount})</span>}
              {f === "inactive" && <span className="ml-1 opacity-70">({allPlugins.length - activeCount})</span>}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search plugins…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={deactivateAll}
            className="text-xs text-slate-500 hover:text-slate-300 px-2.5 py-1.5 rounded border border-slate-700 hover:border-slate-500 transition-colors"
          >
            Deactivate All
          </button>
          <button
            onClick={activateAll}
            className="text-xs text-slate-500 hover:text-slate-300 px-2.5 py-1.5 rounded border border-slate-700 hover:border-slate-500 transition-colors"
          >
            Activate All
          </button>
        </div>
      </div>

      {/* Plugin List */}
      {filtered.length === 0 ? (
        <div className="text-slate-500 text-sm text-center py-12 bg-slate-900 border border-slate-800 rounded-xl">
          No plugins match your search.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800">
          {filtered.map((plugin) => {
            const isActive = enabled.has(plugin.id);
            const isActivating = activating === plugin.id;
            const isDeleting = deleting === plugin.id;

            return (
              <div
                key={plugin.id}
                className={`flex items-start gap-4 px-5 py-4 transition-colors hover:bg-slate-800/30 border-l-2 ${
                  isActive ? "border-amber-500 bg-amber-950/5" : "border-transparent"
                }`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 mt-0.5 ${
                  isActive ? "bg-amber-900/30" : "bg-slate-800"
                }`}>
                  {plugin.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white">{plugin.label}</p>

                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      plugin.category === "section"
                        ? "bg-blue-900/40 text-blue-400"
                        : "bg-purple-900/40 text-purple-400"
                    }`}>
                      {CATEGORY_LABEL[plugin.category]}
                    </span>

                    {isActive && (
                      <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        Active
                      </span>
                    )}

                    {plugin.custom && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 font-medium">
                        Custom
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {plugin.description}
                  </p>

                  {(plugin.author || plugin.version) && (
                    <p className="text-xs text-slate-600 mt-1">
                      {plugin.author && <>By {plugin.author}</>}
                      {plugin.author && plugin.version && " · "}
                      {plugin.version && <>v{plugin.version}</>}
                    </p>
                  )}

                  {/* WordPress-style action links */}
                  <div className="flex items-center gap-2 mt-2.5">
                    <button
                      onClick={() => togglePlugin(plugin.id, plugin.label)}
                      disabled={isActivating}
                      className={`text-xs font-medium transition-colors disabled:opacity-40 ${
                        isActive
                          ? "text-red-400 hover:text-red-300"
                          : "text-amber-500 hover:text-amber-400"
                      }`}
                    >
                      {isActivating ? (
                        <span className="flex items-center gap-1">
                          <Loader2 size={11} className="animate-spin" />
                          {isActive ? "Deactivating…" : "Activating…"}
                        </span>
                      ) : (
                        isActive ? "Deactivate" : "Activate"
                      )}
                    </button>

                    {plugin.custom && (
                      <>
                        <span className="text-slate-700 select-none">|</span>
                        <button
                          onClick={() => deletePlugin(plugin.id, plugin.label)}
                          disabled={isDeleting}
                          className="text-xs text-red-500/60 hover:text-red-400 transition-colors disabled:opacity-40 flex items-center gap-1"
                        >
                          {isDeleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                          Delete
                        </button>
                      </>
                    )}

                    <span className="text-slate-700 select-none">|</span>
                    <span className="text-xs text-slate-600">
                      {plugin.custom ? "Installed" : "Built-in"}
                    </span>
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => togglePlugin(plugin.id, plugin.label)}
                  disabled={isActivating}
                  aria-label={`${isActive ? "Deactivate" : "Activate"} ${plugin.label}`}
                  className={`relative shrink-0 w-10 h-5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-40 mt-1 ${
                    isActive ? "bg-amber-600" : "bg-slate-700"
                  }`}
                  aria-checked={isActive}
                  role="switch"
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    isActive ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-slate-600 mt-4 text-center">
        Changes take effect immediately. Reload the site to see updated sections.
      </p>
    </div>
  );
}
