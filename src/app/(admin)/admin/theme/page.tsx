"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAdminAuth } from "@/app/(admin)/admin/layout";
import {
  Upload, Check, RefreshCw, Save, Loader2, X, Palette, Layers,
  Eye, AlertCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  type SiteTheme,
  DEFAULT_THEME,
  FONT_OPTIONS,
  RADIUS_OPTIONS,
} from "@/core/themes";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ThemeInfo {
  key: string;
  name: string;
  description: string;
  version: string;
  author: string;
  screenshot: string | null;
  isActive: boolean;
  isBuiltIn: boolean;
  colors?: Record<string, string>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function previewFont(css: string): string {
  return css
    .replace("var(--font-geist-sans),", "")
    .replace("var(--font-geist-mono),", "")
    .trim();
}

function getRadiusCss(value: string) {
  return RADIUS_OPTIONS.find((r) => r.value === value)?.css ?? "0.75rem";
}

const SAMPLE_MANIFEST = JSON.stringify(
  {
    id: "my-theme",
    name: "My Theme",
    version: "1.0.0",
    author: "Your Name",
    description: "A custom color preset",
    colors: {
      primaryColor: "#1e40af",
      accentColor: "#3b82f6",
      bgDark: "#0f172a",
    },
    typography: { fontFamily: "georgia" },
    borderRadius: "md",
  },
  null,
  2
);

// ── Main Component ────────────────────────────────────────────────────────────

export default function ThemeAdmin() {
  const { pin } = useAdminAuth();
  const [tab, setTab] = useState<"installed" | "customize">("installed");

  // Themes list
  const [themes, setThemes] = useState<ThemeInfo[]>([]);
  const [themesLoading, setThemesLoading] = useState(true);
  const [activating, setActivating] = useState<string | null>(null);

  // Upload panel
  const [uploadOpen, setUploadOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Customize
  const [siteTheme, setSiteTheme] = useState<SiteTheme>(DEFAULT_THEME);
  const [customizeLoading, setCustomizeLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Shared toast
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = useCallback((msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadThemes = useCallback(() => {
    if (!pin) return;
    setThemesLoading(true);
    fetch("/api/admin/themes", { headers: { "x-admin-pin": pin } })
      .then((r) => r.json())
      .then((data: unknown) => {
        setThemes(Array.isArray(data) ? data as ThemeInfo[] : []);
        setThemesLoading(false);
      })
      .catch(() => setThemesLoading(false));
  }, [pin]);

  useEffect(() => {
    if (!pin) return;
    // loadThemes is a useCallback that triggers setState — this is intentional
    // (data-fetching on mount), not a cascading render anti-pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadThemes();
    // Load current siteTheme for customize tab
    fetch("/api/db/settings", { headers: { "x-admin-pin": pin } })
      .then((r) => r.json())
      .then((data: Record<string, unknown>) => {
        const raw = data.siteTheme as Partial<SiteTheme> | undefined;
        if (raw) setSiteTheme({ ...DEFAULT_THEME, ...raw });
        setCustomizeLoading(false);
      })
      .catch(() => setCustomizeLoading(false));
  }, [pin, loadThemes]);

  const activate = async (themeKey: string) => {
    setActivating(themeKey);
    const res = await fetch("/api/admin/themes", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-pin": pin },
      body: JSON.stringify({ themeKey }),
    });
    if (res.ok) {
      setThemes((prev) => prev.map((t) => ({ ...t, isActive: t.key === themeKey })));
      showToast("Theme activated — reload the site to see changes.");
    } else {
      const j = await res.json().catch(() => ({})) as { error?: string };
      showToast(j.error ?? "Failed to activate theme", "err");
    }
    setActivating(null);
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith(".json")) {
      showToast("Only .json theme manifest files are supported", "err");
      return;
    }
    setUploading(true);
    try {
      const text = await file.text();
      const config = JSON.parse(text) as Record<string, unknown>;
      if (!config.id || !config.name) {
        showToast("Invalid manifest: must have 'id' and 'name' fields", "err");
        setUploading(false);
        return;
      }
      const res = await fetch("/api/admin/themes/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-pin": pin },
        body: JSON.stringify(config),
      });
      const j = await res.json().catch(() => ({})) as { error?: string; name?: string };
      if (res.ok) {
        showToast(`Theme "${j.name ?? config.name}" installed successfully!`);
        setUploadOpen(false);
        loadThemes();
      } else {
        showToast(j.error ?? "Upload failed", "err");
      }
    } catch {
      showToast("Failed to parse theme file", "err");
    }
    setUploading(false);
  };

  const saveCustomize = async () => {
    setSaving(true);
    const res = await fetch("/api/db/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-pin": pin },
      body: JSON.stringify({ siteTheme }),
    });
    setSaving(false);
    if (res.ok) showToast("Theme customization saved — reload the site to see changes.");
    else showToast("Save failed", "err");
  };

  const setThemeField = <K extends keyof SiteTheme>(key: K, val: SiteTheme[K]) =>
    setSiteTheme((t) => ({ ...t, [key]: val }));

  const activeTheme = themes.find((t) => t.isActive);

  return (
    <div className="max-w-5xl">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Themes</h1>
          <p className="text-slate-400 text-sm mt-1">
            {activeTheme
              ? <>Active theme: <span className="text-amber-400 font-medium">{activeTheme.name}</span></>
              : "Manage and customize your site's appearance"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {toast && (
            <span className={`flex items-center gap-1.5 text-xs font-medium max-w-xs text-right ${toast.type === "err" ? "text-red-400" : "text-green-400"}`}>
              {toast.type === "err" ? <AlertCircle size={13} /> : <Check size={13} />}
              {toast.msg}
            </span>
          )}
          <button
            onClick={() => setUploadOpen((v) => !v)}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            <Upload size={14} /> Add New Theme
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-slate-900 border border-slate-700 rounded-lg p-1 mb-6 w-fit">
        <button
          onClick={() => setTab("installed")}
          className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded transition-colors ${
            tab === "installed" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          <Layers size={14} /> Installed Themes
        </button>
        <button
          onClick={() => setTab("customize")}
          className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded transition-colors ${
            tab === "customize" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          <Palette size={14} /> Customize
        </button>
      </div>

      {/* ── Upload Panel ── */}
      {uploadOpen && (
        <div className="mb-6 bg-slate-900 border border-amber-800/50 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Upload size={14} className="text-amber-400" /> Install Theme
            </h2>
            <button onClick={() => setUploadOpen(false)} className="text-slate-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="p-5 grid lg:grid-cols-2 gap-5">
            {/* Drop zone */}
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
                  <Upload size={28} className="mx-auto text-slate-500 mb-3" />
                )}
                <p className="text-sm font-medium text-slate-300">
                  {uploading ? "Installing…" : "Drop theme.json here or click to browse"}
                </p>
                <p className="text-xs text-slate-500 mt-1">Accepts .json theme manifest files</p>
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

            {/* Format guide */}
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2">Theme manifest format (theme.json)</p>
              <pre className="text-xs text-slate-400 font-mono bg-slate-800 rounded-xl p-4 overflow-x-auto leading-relaxed">
                {SAMPLE_MANIFEST}
              </pre>
              <p className="text-xs text-slate-500 mt-3">
                Config presets apply colors and fonts to the active theme templates. For full template themes, contact your developer.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Installed Themes Tab ── */}
      {tab === "installed" && (
        <>
          {themesLoading ? (
            <div className="text-slate-400 text-sm flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Loading themes…
            </div>
          ) : themes.length === 0 ? (
            <div className="text-slate-500 text-sm text-center py-16 bg-slate-900 border border-slate-800 rounded-xl">
              No themes found. Upload a theme.json to get started.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {themes.map((t) => (
                <ThemeCard
                  key={t.key}
                  theme={t}
                  activating={activating === t.key}
                  onActivate={() => activate(t.key)}
                  onCustomize={() => setTab("customize")}
                />
              ))}

              {/* "Add New" placeholder card */}
              <button
                onClick={() => setUploadOpen(true)}
                className="rounded-xl border-2 border-dashed border-slate-700 hover:border-amber-600/60 transition-colors flex flex-col items-center justify-center gap-3 min-h-[220px] text-slate-500 hover:text-amber-400"
              >
                <Upload size={28} />
                <span className="text-sm font-medium">Add New Theme</span>
              </button>
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              Active theme
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded border border-slate-600 inline-block" />
              Built-in (full templates)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded border border-dashed border-slate-600 inline-block" />
              Config preset (colors only)
            </span>
          </div>
        </>
      )}

      {/* ── Customize Tab ── */}
      {tab === "customize" && (
        customizeLoading ? (
          <div className="text-slate-400 text-sm flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" /> Loading…
          </div>
        ) : (
          <div className="space-y-5">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Customizing:{" "}
                <span className="text-amber-400 font-semibold">{activeTheme?.name ?? "Default"}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setSiteTheme(DEFAULT_THEME); showToast("Reset to defaults — click Save to apply."); }}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm px-3 py-2 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors"
                >
                  <RefreshCw size={13} /> Reset
                </button>
                <button
                  onClick={saveCustomize}
                  disabled={saving}
                  className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save Changes
                </button>
              </div>
            </div>

            {/* Colors */}
            <CustomizeSection title="Colors">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ColorField label="Primary Color" hint="Buttons, highlights, links" value={siteTheme.primaryColor} onChange={(v) => setThemeField("primaryColor", v)} />
                <ColorField label="Accent Color" hint="Hovers & secondary accents" value={siteTheme.accentColor} onChange={(v) => setThemeField("accentColor", v)} />
                <ColorField label="Background" hint="Site background base" value={siteTheme.bgDark} onChange={(v) => setThemeField("bgDark", v)} />
              </div>
            </CustomizeSection>

            {/* Typography */}
            <CustomizeSection title="Typography">
              <p className="text-xs font-semibold text-slate-500 mb-2">Body Font</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {FONT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setThemeField("fontFamily", opt.value)}
                    className={`px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                      siteTheme.fontFamily === opt.value
                        ? "bg-amber-600 border-amber-500 text-white font-semibold"
                        : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500"
                    }`}
                    style={{ fontFamily: previewFont(opt.css) }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </CustomizeSection>

            {/* Border Radius */}
            <CustomizeSection title="Border Radius">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {RADIUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setThemeField("borderRadius", opt.value)}
                    className={`px-3 py-2.5 border text-sm transition-colors ${
                      siteTheme.borderRadius === opt.value
                        ? "bg-amber-600 border-amber-500 text-white font-semibold"
                        : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500"
                    }`}
                    style={{ borderRadius: opt.css }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </CustomizeSection>

            {/* Logo */}
            <CustomizeSection title="Logo">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Logo URL</label>
              <input
                type="text"
                value={siteTheme.logoUrl}
                onChange={(e) => setThemeField("logoUrl", e.target.value)}
                placeholder="/uploads/logo.svg"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              />
              {siteTheme.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={siteTheme.logoUrl} alt="Logo preview" className="mt-3 max-h-12 object-contain" />
              )}
            </CustomizeSection>

            {/* Live Preview */}
            <CustomizeSection title="Live Preview">
              <div
                className="rounded-xl overflow-hidden p-6 text-white"
                style={{
                  background: siteTheme.bgDark,
                  fontFamily: previewFont(FONT_OPTIONS.find((f) => f.value === siteTheme.fontFamily)?.css ?? ""),
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: siteTheme.primaryColor }}>
                  Your Site
                </p>
                <h3 className="text-2xl font-bold mb-3">Your Heading Here</h3>
                <p className="text-sm opacity-70 mb-5">
                  Body text with your selected font and background color.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <span
                    className="px-5 py-2.5 text-sm font-semibold text-white inline-block"
                    style={{ background: siteTheme.primaryColor, borderRadius: getRadiusCss(siteTheme.borderRadius) }}
                  >
                    Primary Button
                  </span>
                  <span
                    className="px-5 py-2.5 text-sm font-medium inline-block"
                    style={{
                      border: `1px solid ${siteTheme.primaryColor}`,
                      color: siteTheme.accentColor,
                      borderRadius: getRadiusCss(siteTheme.borderRadius),
                    }}
                  >
                    Outline Button
                  </span>
                </div>
              </div>
            </CustomizeSection>
          </div>
        )
      )}
    </div>
  );
}

// ── Theme Card ────────────────────────────────────────────────────────────────

function ThemeCard({
  theme,
  activating,
  onActivate,
  onCustomize,
}: {
  theme: ThemeInfo;
  activating: boolean;
  onActivate: () => void;
  onCustomize: () => void;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Generate a preview color from the theme's own colors (or default)
  const previewPrimary = theme.colors?.primaryColor ?? "#b45309";
  const previewBg = theme.colors?.bgDark ?? "#020617";

  return (
    <div
      className={`rounded-xl overflow-hidden border-2 transition-all flex flex-col ${
        theme.isActive
          ? "border-amber-500 shadow-lg shadow-amber-900/20"
          : "border-slate-700 hover:border-slate-500"
      }`}
    >
      {/* Screenshot / generated preview */}
      <div className="relative group aspect-video overflow-hidden flex-shrink-0">
        {theme.screenshot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={theme.screenshot}
            alt={theme.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <GeneratedPreview primary={previewPrimary} bg={previewBg} />
        )}

        {/* Active badge */}
        {theme.isActive && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            <Check size={10} /> Active
          </div>
        )}

        {/* Code vs preset badge */}
        <div className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium ${
          theme.isBuiltIn
            ? "bg-slate-800/90 text-slate-300"
            : "bg-slate-800/90 text-slate-400 border border-dashed border-slate-600"
        }`}>
          {theme.isBuiltIn ? "Full Theme" : "Color Preset"}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {theme.isActive ? (
            <button
              onClick={onCustomize}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Palette size={13} /> Customize
            </button>
          ) : (
            <button
              onClick={onActivate}
              disabled={activating}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {activating ? <Loader2 size={13} className="animate-spin" /> : <Eye size={13} />}
              {activating ? "Activating…" : "Activate"}
            </button>
          )}
          <button
            onClick={() => setDetailsOpen((v) => !v)}
            className="flex items-center gap-1.5 bg-slate-700/90 hover:bg-slate-600 text-slate-200 text-sm px-3 py-2 rounded-lg transition-colors"
          >
            Details
          </button>
        </div>
      </div>

      {/* Info footer */}
      <div className="bg-slate-900 px-4 py-3 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{theme.name}</p>
            {theme.author && (
              <p className="text-xs text-slate-500 mt-0.5">By {theme.author}</p>
            )}
          </div>
          {theme.version && (
            <span className="text-xs text-slate-600 font-mono shrink-0">v{theme.version}</span>
          )}
        </div>

        {/* Theme Details (collapsible) */}
        {detailsOpen && (
          <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
            {theme.description && (
              <p className="text-xs text-slate-400">{theme.description}</p>
            )}
            {theme.colors && Object.keys(theme.colors).length > 0 && (
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-1">Color Palette</p>
                <div className="flex gap-1 flex-wrap">
                  {Object.entries(theme.colors)
                    .filter(([k]) => k.toLowerCase().includes("color") || k === "bgDark")
                    .map(([k, v]) => (
                      <div key={k} className="flex items-center gap-1 text-xs text-slate-500" title={`${k}: ${v}`}>
                        <span
                          className="w-4 h-4 rounded-full inline-block border border-slate-700"
                          style={{ background: v }}
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action row */}
        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          {theme.isActive ? (
            <button
              onClick={onCustomize}
              className="text-xs text-amber-500 hover:text-amber-400 font-medium transition-colors"
            >
              Customize →
            </button>
          ) : (
            <button
              onClick={onActivate}
              disabled={activating}
              className="text-xs text-slate-400 hover:text-white disabled:opacity-40 transition-colors font-medium"
            >
              {activating ? "Activating…" : "Activate"}
            </button>
          )}
          <button
            onClick={() => setDetailsOpen((v) => !v)}
            className="text-slate-600 hover:text-slate-400 transition-colors"
            title={detailsOpen ? "Collapse" : "Details"}
          >
            {detailsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Generated Preview ─────────────────────────────────────────────────────────

function GeneratedPreview({ primary, bg }: { primary: string; bg: string }) {
  return (
    <div className="w-full h-full flex flex-col" style={{ background: bg }}>
      {/* Fake nav */}
      <div className="h-8 flex items-center px-3 gap-2 shrink-0" style={{ background: "rgba(255,255,255,0.04)" }}>
        <div className="w-3 h-3 rounded-full" style={{ background: primary }} />
        <div className="w-14 h-2 rounded bg-white/10" />
        <div className="flex gap-2 ml-auto">
          {[40, 32, 28].map((w, i) => (
            <div key={i} className="h-1.5 rounded" style={{ width: w, background: "rgba(255,255,255,0.12)" }} />
          ))}
        </div>
      </div>

      {/* Fake hero */}
      <div className="flex-1 p-3 flex flex-col gap-2">
        <div className="h-1.5 w-16 rounded" style={{ background: primary, opacity: 0.8 }} />
        <div className="h-4 w-4/5 rounded bg-white/20" />
        <div className="h-2.5 w-2/3 rounded bg-white/20" />
        <div className="h-2.5 w-3/4 rounded bg-white/10 mt-1" />
        <div className="h-2.5 w-1/2 rounded bg-white/10" />
        <div className="flex gap-2 mt-2">
          <div className="h-6 w-20 rounded" style={{ background: primary }} />
          <div className="h-6 w-20 rounded border" style={{ borderColor: primary, opacity: 0.5 }} />
        </div>
      </div>
    </div>
  );
}

// ── Customize Section ─────────────────────────────────────────────────────────

function CustomizeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-slate-300 mb-4">{title}</h2>
      {children}
    </section>
  );
}

// ── Color Field ───────────────────────────────────────────────────────────────

function ColorField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-9 rounded-lg border border-slate-700 bg-slate-800 cursor-pointer p-0.5"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500"
          placeholder="#b45309"
        />
      </div>
      <p className="text-xs text-slate-600 mt-1">{hint}</p>
    </div>
  );
}
