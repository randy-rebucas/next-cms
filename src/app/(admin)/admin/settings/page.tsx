"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/app/(admin)/admin/layout";
import {
  Save,
  CheckCircle,
  Globe,
  PenLine,
  BookOpen,
  ImageIcon,
  Mail,
  Lock,
} from "lucide-react";

type Settings = Record<string, string>;
type FieldType = "text" | "textarea" | "password" | "number" | "select";

interface SelectOption { label: string; value: string }
interface Field {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  hint?: string;
  options?: SelectOption[];
}
interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  fields: Field[];
}

const SECTIONS: Section[] = [
  {
    id: "general",
    title: "General",
    icon: <Globe size={15} />,
    description: "Basic site identity and contact information.",
    fields: [
      { key: "siteName",    label: "Site Name",    type: "text",   placeholder: "My CMS Site" },
      { key: "siteTagline", label: "Tagline",      type: "text",   placeholder: "Just another great website", hint: "In a few words, explain what this site is about." },
      { key: "siteUrl",     label: "Site Address", type: "text",   placeholder: "https://example.com" },
      { key: "adminEmail",  label: "Admin Email",  type: "text",   placeholder: "admin@example.com", hint: "Used for admin notifications." },
      { key: "timezone",    label: "Timezone",     type: "select", options: [
        { label: "UTC",               value: "UTC" },
        { label: "Asia/Manila (PHT)", value: "Asia/Manila" },
        { label: "America/New_York",  value: "America/New_York" },
        { label: "America/Chicago",   value: "America/Chicago" },
        { label: "America/Los_Angeles", value: "America/Los_Angeles" },
        { label: "Europe/London",     value: "Europe/London" },
        { label: "Europe/Paris",      value: "Europe/Paris" },
      ]},
      { key: "dateFormat",  label: "Date Format",  type: "select", options: [
        { label: "January 1, 2025",   value: "MMMM D, YYYY" },
        { label: "01/01/2025",        value: "MM/DD/YYYY" },
        { label: "2025-01-01",        value: "YYYY-MM-DD" },
        { label: "1 January, 2025",   value: "D MMMM, YYYY" },
      ]},
    ],
  },
  {
    id: "writing",
    title: "Writing",
    icon: <PenLine size={15} />,
    description: "Settings that affect the content authoring experience.",
    fields: [
      { key: "defaultCategory",   label: "Default Post Category", type: "text", placeholder: "Uncategorized" },
      { key: "defaultPostFormat", label: "Default Post Format",   type: "select", options: [
        { label: "Standard", value: "standard" },
        { label: "Aside",    value: "aside" },
        { label: "Image",    value: "image" },
        { label: "Video",    value: "video" },
        { label: "Quote",    value: "quote" },
        { label: "Link",     value: "link" },
      ]},
      { key: "openaiApiKey", label: "OpenAI API Key", type: "password", placeholder: "sk-…", hint: "Used for AI-assisted content generation." },
    ],
  },
  {
    id: "reading",
    title: "Reading",
    icon: <BookOpen size={15} />,
    description: "Adjust how your published content is displayed to visitors.",
    fields: [
      { key: "postsPerPage",   label: "Blog pages show at most",  type: "number", placeholder: "10", hint: "Number of posts to display per page." },
      { key: "siteDescription", label: "Search Engine Visibility Meta Description", type: "textarea", placeholder: "Brief description used by search engines…" },
      { key: "robotsPolicy",  label: "Search Engine Indexing",   type: "select", options: [
        { label: "Allow search engines to index this site", value: "index" },
        { label: "Discourage search engines (noindex)",     value: "noindex" },
      ]},
    ],
  },
  {
    id: "media",
    title: "Media",
    icon: <ImageIcon size={15} />,
    description: "Set default dimensions for auto-generated image sizes.",
    fields: [
      { key: "thumbWidth",  label: "Thumbnail Width",  type: "number", placeholder: "150" },
      { key: "thumbHeight", label: "Thumbnail Height", type: "number", placeholder: "150" },
      { key: "mediumWidth",  label: "Medium Width",  type: "number", placeholder: "300" },
      { key: "mediumHeight", label: "Medium Height", type: "number", placeholder: "300" },
      { key: "largeWidth",  label: "Large Width",  type: "number", placeholder: "1024" },
      { key: "largeHeight", label: "Large Height", type: "number", placeholder: "1024" },
    ],
  },
  {
    id: "email",
    title: "Email",
    icon: <Mail size={15} />,
    description: "SMTP settings for outgoing transactional email.",
    fields: [
      { key: "smtpHost",       label: "SMTP Host",     type: "text",     placeholder: "smtp.example.com" },
      { key: "smtpPort",       label: "SMTP Port",     type: "number",   placeholder: "587" },
      { key: "smtpUser",       label: "SMTP Username", type: "text",     placeholder: "user@example.com" },
      { key: "smtpPassword",   label: "SMTP Password", type: "password", placeholder: "••••••••" },
      { key: "smtpEncryption", label: "Encryption",    type: "select",   options: [
        { label: "TLS",  value: "tls" },
        { label: "SSL",  value: "ssl" },
        { label: "None", value: "none" },
      ]},
      { key: "mailFromName",    label: "From Name",    type: "text", placeholder: "My Site" },
      { key: "mailFromAddress", label: "From Address", type: "text", placeholder: "noreply@example.com" },
    ],
  },
  {
    id: "admin",
    title: "Admin",
    icon: <Lock size={15} />,
    description: "Security and system-level configuration.",
    fields: [
      { key: "adminPin", label: "Admin PIN", type: "password", placeholder: "Leave blank to keep current PIN", hint: "Used to authenticate API requests from the admin panel." },
    ],
  },
];

export default function SettingsAdmin() {
  const { pin } = useAdminAuth();
  const [settings, setSettings] = useState<Settings>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

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
    const section = SECTIONS.find((s) => s.id === activeId);
    if (!section) return;
    const payload: Settings = {};
    for (const f of section.fields) {
      if (f.type === "password" && !settings[f.key]) continue;
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

  const current = SECTIONS.find((s) => s.id === activeId)!;

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage site-wide configuration</p>
      </div>

      <div className="flex gap-6">
        {/* Side tabs */}
        <div className="w-44 shrink-0">
          <nav className="space-y-0.5">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => { setActiveId(s.id); setError(""); setSaved(false); }}
                className={`w-full text-left flex items-center gap-2.5 text-sm px-3 py-2 rounded-lg transition-colors ${
                  activeId === s.id
                    ? "bg-amber-600/20 text-amber-400 font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <span className={activeId === s.id ? "text-amber-400" : "text-slate-500"}>{s.icon}</span>
                {s.title}
              </button>
            ))}
          </nav>
        </div>

        {/* Fields panel */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-amber-400">{current.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{current.description}</p>
          </div>

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
                ) : f.type === "select" ? (
                  <select
                    value={settings[f.key] ?? ""}
                    onChange={(e) => set(f.key, e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">— select —</option>
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type === "password" ? "password" : f.type === "number" ? "number" : "text"}
                    value={settings[f.key] ?? ""}
                    onChange={(e) => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                )}
                {f.hint && <p className="text-xs text-slate-500 mt-1">{f.hint}</p>}
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
                <CheckCircle size={14} /> Saved
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
