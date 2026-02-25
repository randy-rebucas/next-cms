"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/app/(admin)/admin/layout";
import { Loader2, Save } from "lucide-react";
import { PLUGIN_REGISTRY, DEFAULT_ENABLED, type PluginDef } from "@/core/plugins";

export default function PluginsAdmin() {
  const { pin } = useAdminAuth();
  const [enabled, setEnabled] = useState<Set<string>>(new Set(DEFAULT_ENABLED));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!pin) return;
    fetch("/api/db/settings", { headers: { "x-admin-pin": pin } })
      .then((r) => r.json())
      .then((data: Record<string, unknown>) => {
        const raw = data.enabledPlugins;
        if (Array.isArray(raw)) setEnabled(new Set(raw as string[]));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pin]);

  const toggle = (id: string) =>
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const enableAll = () => setEnabled(new Set(PLUGIN_REGISTRY.map((p) => p.id)));
  const disableAll = () => setEnabled(new Set());

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/db/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-pin": pin },
      body: JSON.stringify({ enabledPlugins: [...enabled] }),
    });
    setSaving(false);
    if (res.ok) {
      setToast("Saved — reload the site to see changes.");
      setTimeout(() => setToast(""), 4000);
    } else {
      setToast("Save failed");
    }
  };

  const sections = PLUGIN_REGISTRY.filter((p) => p.category === "section");
  const tools    = PLUGIN_REGISTRY.filter((p) => p.category === "tool");

  if (loading) return <div className="text-slate-400 text-sm">Loading…</div>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Plugins</h1>
          <p className="text-slate-400 text-sm mt-1">
            Toggle which sections and tools appear on the site.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {toast && <span className="text-xs text-amber-300 max-w-xs text-right">{toast}</span>}
          <button onClick={disableAll} className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1.5 underline underline-offset-2 transition-colors">
            Disable all
          </button>
          <button onClick={enableAll} className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1.5 underline underline-offset-2 transition-colors">
            Enable all
          </button>
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

      <div className="space-y-6">
        <PluginGroup
          title="Home Page Sections"
          description="These sections appear on the public home page."
          plugins={sections}
          enabled={enabled}
          onToggle={toggle}
        />
        <PluginGroup
          title="Legal Tools (tabs)"
          description="Individual tabs inside the Legal Tools section. The section must be enabled above."
          plugins={tools}
          enabled={enabled}
          onToggle={toggle}
          dimmed={!enabled.has("tools-section")}
        />
      </div>
    </div>
  );
}

function PluginGroup({
  title,
  description,
  plugins,
  enabled,
  onToggle,
  dimmed = false,
}: {
  title: string;
  description: string;
  plugins: PluginDef[];
  enabled: Set<string>;
  onToggle: (id: string) => void;
  dimmed?: boolean;
}) {
  return (
    <section className={`bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-opacity ${dimmed ? "opacity-40" : ""}`}>
      <div className="px-5 py-3 border-b border-slate-800">
        <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <div className="divide-y divide-slate-800">
        {plugins.map((plugin) => {
          const on = enabled.has(plugin.id);
          return (
            <div
              key={plugin.id}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-800/50 transition-colors"
            >
              <span className="text-xl">{plugin.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{plugin.label}</p>
                <p className="text-xs text-slate-500 truncate">{plugin.description}</p>
              </div>
              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => onToggle(plugin.id)}
                aria-label={`${on ? "Disable" : "Enable"} ${plugin.label}`}
                className={`relative shrink-0 w-10 h-5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  on ? "bg-amber-600" : "bg-slate-700"
                }`}
                aria-checked={on}
                role="switch"
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    on ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
