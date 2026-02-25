"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/app/admin/layout";
import { Save, CheckCircle } from "lucide-react";

type Settings = Record<string, string>;

interface Section {
  title: string;
  fields: { key: string; label: string; type: "text" | "textarea" | "password"; placeholder?: string }[];
}

const SECTIONS: Section[] = [
  {
    title: "General",
    fields: [
      { key: "lawyerName", label: "Lawyer Name", type: "text", placeholder: "Atty. Levi Tobalígud Baltazar Baligod" },
      { key: "siteTitle", label: "Site Title / Tagline", type: "text", placeholder: "Baligod Law Office" },
      { key: "siteDescription", label: "Meta Description", type: "textarea", placeholder: "Brief description for SEO…" },
      { key: "barNumber", label: "Bar / IBP Number", type: "text", placeholder: "IBP No. XXXXX" },
    ],
  },
  {
    title: "Contact",
    fields: [
      { key: "phone", label: "Phone", type: "text", placeholder: "+63 917 XXX XXXX" },
      { key: "email", label: "Email", type: "text", placeholder: "consult@baligodlaw.ph" },
      { key: "address", label: "Office Address", type: "textarea", placeholder: "Unit X, Building, Makati City" },
      { key: "consultationHours", label: "Consultation Hours", type: "text", placeholder: "Monday – Friday, 9:00 AM – 5:00 PM" },
    ],
  },
  {
    title: "Hero Section",
    fields: [
      { key: "heroTitle", label: "Hero Title", type: "text", placeholder: "Fierce Advocacy. Unwavering Integrity." },
      { key: "heroSubtitle", label: "Hero Subtitle", type: "textarea", placeholder: "Dedicated legal representation…" },
    ],
  },
  {
    title: "About / Bio",
    fields: [
      { key: "bioParagraph1", label: "Bio Paragraph 1", type: "textarea" },
      { key: "bioParagraph2", label: "Bio Paragraph 2", type: "textarea" },
      { key: "bioTagline", label: "Bio Tagline / Quote", type: "text" },
    ],
  },
  {
    title: "Admin",
    fields: [
      { key: "adminPin", label: "Admin PIN", type: "password", placeholder: "Enter new PIN (leave blank to keep current)" },
      { key: "openaiApiKey", label: "OpenAI API Key", type: "password", placeholder: "sk-…" },
    ],
  },
];

export default function SettingsAdmin() {
  const { pin } = useAdminAuth();
  const [settings, setSettings] = useState<Settings>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState(SECTIONS[0].title);

  useEffect(() => {
    if (!pin) return;
    fetch("/api/db/settings", { headers: { "x-admin-pin": pin } })
      .then((r) => r.json())
      .then((data: Settings) => setSettings(data))
      .catch(() => {});
  }, [pin]);

  const set = (key: string, val: string) => setSettings((s) => ({ ...s, [key]: val }));

  const saveSection = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    const section = SECTIONS.find((s) => s.title === activeSection);
    if (!section) return;
    const payload: Settings = {};
    for (const f of section.fields) {
      if (f.type === "password" && !settings[f.key]) continue; // Skip blank password fields
      payload[f.key] = settings[f.key] ?? "";
    }
    const res = await fetch("/api/db/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-pin": pin },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      const j = await res.json().catch(() => ({})) as { error?: string };
      setError(j.error ?? "Save failed");
    }
    setSaving(false);
  };

  const current = SECTIONS.find((s) => s.title === activeSection)!;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 text-sm mt-1">Site-wide configuration</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Side tabs */}
        <div className="w-40 shrink-0">
          <nav className="space-y-1">
            {SECTIONS.map((s) => (
              <button
                key={s.title}
                onClick={() => { setActiveSection(s.title); setError(""); setSaved(false); }}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${activeSection === s.title ? "bg-amber-600/20 text-amber-400 font-semibold" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
              >
                {s.title}
              </button>
            ))}
          </nav>
        </div>

        {/* Fields */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-amber-400 mb-4">{current.title}</h2>
          <div className="space-y-4">
            {current.fields.map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-slate-400 mb-1">{f.label}</label>
                {f.type === "textarea" ? (
                  <textarea
                    rows={3}
                    value={settings[f.key] ?? ""}
                    onChange={(e) => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 resize-y"
                  />
                ) : (
                  <input
                    type={f.type === "password" ? "password" : "text"}
                    value={settings[f.key] ?? ""}
                    onChange={(e) => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                )}
              </div>
            ))}
          </div>

          {error && <p className="text-xs text-red-400 mt-4">{error}</p>}

          <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-800">
            <button
              onClick={saveSection}
              disabled={saving}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <Save size={14} /> {saving ? "Saving…" : `Save ${current.title}`}
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-400">
                <CheckCircle size={14} /> Saved!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
