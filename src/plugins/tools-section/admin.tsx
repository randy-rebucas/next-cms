"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { useAdminAuth } from "@/app/(admin)/admin/layout";

const TABS = [
  { id: "sol-calculator",        label: "SOL Calculator",      icon: "⏱", description: "Statute of limitations date calculator." },
  { id: "legal-glossary",        label: "Legal Glossary",      icon: "📖", description: "Searchable legal terms dictionary." },
  { id: "document-checklist",    label: "Document Checklist",  icon: "✅", description: "Client document preparation checklist." },
  { id: "consultation-booking",  label: "Consultation Booking",icon: "📅", description: "Book a free consultation form." },
  { id: "case-evaluation",       label: "Case Evaluation",     icon: "📝", description: "Interactive case assessment questionnaire." },
] as const;

type TabId = (typeof TABS)[number]["id"];

/**
 * Tools Section plugin admin panel.
 * Lets the site owner toggle individual tool tabs on/off.
 * Persists as `enabledPlugins` in site settings.
 *
 * Embed at /admin/plugins/tools-section
 */
export default function ToolsSectionAdmin() {
  const { pin } = useAdminAuth();
  const [enabled, setEnabled] = useState<Set<TabId>>(
    () => new Set(TABS.map((t) => t.id))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  // Load current enabled plugins from settings
  useEffect(() => {
    if (!pin) return;
    fetch("/api/db/settings", { headers: { "x-admin-pin": pin } })
      .then((r) => r.json())
      .then((data: Record<string, unknown>) => {
        const raw = data.enabledPlugins;
        if (Array.isArray(raw)) {
          const tabIds = TABS.map((t) => t.id) as string[];
          const active = (raw as string[]).filter((id) =>
            tabIds.includes(id)
          ) as TabId[];
          setEnabled(new Set(active.length ? active : (TABS.map((t) => t.id) as TabId[])));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pin]);

  const toggle = (id: TabId) =>
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });

  const save = async () => {
    setSaving(true);
    // Fetch full enabledPlugins, replace only the tab IDs managed by this plugin
    const res = await fetch("/api/db/settings", { headers: { "x-admin-pin": pin } });
    const current = (await res.json()) as Record<string, unknown>;
    const existing: string[] = Array.isArray(current.enabledPlugins)
      ? (current.enabledPlugins as string[])
      : [];
    const tabIds = TABS.map((t) => t.id) as string[];
    // Remove all tab IDs, then add back only enabled ones
    const merged = [
      ...existing.filter((id) => !tabIds.includes(id)),
      ...Array.from(enabled),
    ];
    const saveRes = await fetch("/api/db/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-pin": pin },
      body: JSON.stringify({ enabledPlugins: merged }),
    });
    setSaving(false);
    setToast(saveRes.ok ? "Settings saved." : "Save failed.");
    setTimeout(() => setToast(""), 3000);
  };

  if (loading) return <div className="text-slate-400 text-sm">Loading…</div>;

  const enabledCount = enabled.size;

  return (
    <div className="max-w-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Tools Section</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Toggle individual tool tabs shown on the public home page.
          </p>
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

      {/* Status badge */}
      <p className="text-xs text-slate-500">
        {enabledCount} of {TABS.length} tools enabled
      </p>

      {/* Tab toggles */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800">
        {TABS.map((tab) => {
          const isOn = enabled.has(tab.id);
          return (
            <label
              key={tab.id}
              className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-slate-800/50 transition-colors"
            >
              <span className="text-2xl select-none">{tab.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200">{tab.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{tab.description}</p>
              </div>
              {/* Toggle switch */}
              <div
                onClick={() => toggle(tab.id)}
                className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
                  isOn ? "bg-amber-500" : "bg-slate-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    isOn ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </div>
            </label>
          );
        })}
      </div>

      <p className="text-xs text-slate-600">
        Changes take effect on the next public page load. The entire Tools Section
        is hidden when all tabs are disabled.
      </p>
    </div>
  );
}
