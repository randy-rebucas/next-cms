"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/app/(admin)/admin/layout";
import { Loader2, Save } from "lucide-react";

interface SeoSettings {
  siteName: string;
  defaultOgImage: string;
  twitterHandle: string;
  noindex: boolean;
}

const DEFAULTS: SeoSettings = {
  siteName: "Baligod Law Office",
  defaultOgImage: "",
  twitterHandle: "",
  noindex: false,
};

/**
 * SEO plugin admin panel.
 * Renders as a standalone page — embed at /admin/plugins/seo
 * or mount inside AdminLayout.
 */
export default function SeoAdmin() {
  const { pin } = useAdminAuth();
  const [settings, setSettings] = useState<SeoSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!pin) return;
    fetch("/api/db/settings", { headers: { "x-admin-pin": pin } })
      .then((r) => r.json())
      .then((data: Record<string, unknown>) => {
        const raw = data.seoSettings as Partial<SeoSettings> | undefined;
        if (raw) setSettings({ ...DEFAULTS, ...raw });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pin]);

  const set = <K extends keyof SeoSettings>(key: K, val: SeoSettings[K]) =>
    setSettings((s) => ({ ...s, [key]: val }));

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/db/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-pin": pin },
      body: JSON.stringify({ seoSettings: settings }),
    });
    setSaving(false);
    setToast(res.ok ? "SEO settings saved." : "Save failed.");
    setTimeout(() => setToast(""), 3000);
  };

  if (loading) return <div className="text-slate-400 text-sm">Loading…</div>;

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">SEO Settings</h2>
          <p className="text-slate-400 text-sm mt-0.5">Global defaults applied when post-level meta is absent.</p>
        </div>
        <div className="flex items-center gap-2">
          {toast && <span className="text-xs text-amber-300">{toast}</span>}
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save
          </button>
        </div>
      </div>

      <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <Field
          label="Site Name"
          hint="Appended to all page titles: Post Title | Site Name"
          value={settings.siteName}
          onChange={(v) => set("siteName", v)}
        />
        <Field
          label="Default OG Image URL"
          hint="Fallback social share image when a post has no featured image."
          value={settings.defaultOgImage}
          onChange={(v) => set("defaultOgImage", v)}
          placeholder="/uploads/og-default.jpg"
        />
        <Field
          label="Twitter / X Handle"
          hint='Used in twitter:site meta tag. Include the @.'
          value={settings.twitterHandle}
          onChange={(v) => set("twitterHandle", v)}
          placeholder="@baligodlaw"
        />
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.noindex}
            onChange={(e) => set("noindex", e.target.checked)}
            className="w-4 h-4 accent-amber-500"
          />
          <span className="text-sm text-slate-300">
            Noindex entire site{" "}
            <span className="text-slate-500">(useful while staging)</span>
          </span>
        </label>
      </section>
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  placeholder = "",
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 mb-1">{label}</p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
      />
      <p className="text-xs text-slate-600 mt-1">{hint}</p>
    </div>
  );
}
