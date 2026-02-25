"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/app/admin/layout";
import { Loader2, Save, RefreshCw } from "lucide-react";
import {
  type SiteTheme,
  DEFAULT_THEME,
  FONT_OPTIONS,
  RADIUS_OPTIONS,
} from "@/lib/theme";

// Resolve CSS font family string for preview — strip unresolvable CSS vars with fallback
function previewFont(css: string): string {
  return css
    .replace("var(--font-geist-sans),", "")
    .replace("var(--font-geist-mono),", "")
    .trim();
}

function getRadiusCss(value: string) {
  return RADIUS_OPTIONS.find((r) => r.value === value)?.css ?? "0.75rem";
}

export default function ThemeAdmin() {
  const { pin } = useAdminAuth();
  const [theme, setTheme] = useState<SiteTheme>(DEFAULT_THEME);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pin) return;
    fetch("/api/db/settings", { headers: { "x-admin-pin": pin } })
      .then((r) => r.json())
      .then((data: Record<string, unknown>) => {
        const raw = data.siteTheme as Partial<SiteTheme> | undefined;
        if (raw) setTheme({ ...DEFAULT_THEME, ...raw });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pin]);

  const set = <K extends keyof SiteTheme>(key: K, val: SiteTheme[K]) =>
    setTheme((t) => ({ ...t, [key]: val }));

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/db/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-pin": pin },
      body: JSON.stringify({ siteTheme: theme }),
    });
    setSaving(false);
    if (res.ok) {
      setToast("Theme saved — reload the site to see changes.");
      setTimeout(() => setToast(""), 4000);
    } else {
      setToast("Save failed");
    }
  };

  const reset = () => {
    setTheme(DEFAULT_THEME);
    setToast("Reset to defaults — click Save to apply.");
    setTimeout(() => setToast(""), 3000);
  };

  if (loading) return <div className="text-slate-400 text-sm">Loading…</div>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Theme</h1>
          <p className="text-slate-400 text-sm mt-1">
            Customize colors, typography and shape — changes apply site-wide.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {toast && <span className="text-xs text-amber-300 max-w-xs text-right">{toast}</span>}
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm px-3 py-2 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors"
          >
            <RefreshCw size={13} /> Reset
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Theme
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Colors */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Colors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ColorField
              label="Primary Color"
              hint="Buttons, highlights, links"
              value={theme.primaryColor}
              onChange={(v) => set("primaryColor", v)}
            />
            <ColorField
              label="Accent Color"
              hint="Secondary accents & hovers"
              value={theme.accentColor}
              onChange={(v) => set("accentColor", v)}
            />
            <ColorField
              label="Dark Background"
              hint="Site background base"
              value={theme.bgDark}
              onChange={(v) => set("bgDark", v)}
            />
          </div>
        </section>

        {/* Typography */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Typography</h2>
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Body Font</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FONT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => set("fontFamily", opt.value)}
                  className={`px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                    theme.fontFamily === opt.value
                      ? "bg-amber-600 border-amber-500 text-white font-semibold"
                      : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500"
                  }`}
                  style={{ fontFamily: previewFont(opt.css) }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Shape */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Border Radius</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {RADIUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => set("borderRadius", opt.value)}
                className={`px-3 py-2.5 border text-sm transition-colors ${
                  theme.borderRadius === opt.value
                    ? "bg-amber-600 border-amber-500 text-white font-semibold"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500"
                }`}
                style={{ borderRadius: opt.css }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Logo URL */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Logo</h2>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Logo URL</label>
            <input
              type="text"
              value={theme.logoUrl}
              onChange={(e) => set("logoUrl", e.target.value)}
              placeholder="/uploads/2024/01/logo.svg"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            />
            {theme.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={theme.logoUrl} alt="Logo preview" className="mt-3 max-h-12 object-contain" />
            )}
          </div>
        </section>

        {/* Live preview */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Preview</h2>
          <div
            className="rounded-xl overflow-hidden p-6 text-white"
            style={{ background: theme.bgDark, fontFamily: previewFont(FONT_OPTIONS.find((f) => f.value === theme.fontFamily)?.css ?? "") }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: theme.primaryColor }}>
              Law Office
            </p>
            <h3 className="text-2xl font-bold mb-3">Your Law Firm Heading</h3>
            <p className="text-sm opacity-70 mb-5">
              This is how body text appears with your selected font and background color.
            </p>
            <div className="flex gap-3 flex-wrap">
              <span
                className="px-5 py-2.5 text-sm font-semibold text-white inline-block"
                style={{ background: theme.primaryColor, borderRadius: getRadiusCss(theme.borderRadius) }}
              >
                Primary Button
              </span>
              <span
                className="px-5 py-2.5 text-sm font-medium inline-block"
                style={{
                  border: `1px solid ${theme.primaryColor}`,
                  color: theme.accentColor,
                  borderRadius: getRadiusCss(theme.borderRadius),
                }}
              >
                Outline Button
              </span>
            </div>
            <div className="mt-4 flex gap-2 flex-wrap">
              {(["Primary", "Accent"] as const).map((name, i) => (
                <span
                  key={name}
                  className="text-xs font-bold px-3 py-1"
                  style={{
                    background: i === 0 ? theme.primaryColor : theme.accentColor,
                    borderRadius: getRadiusCss(theme.borderRadius),
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

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
