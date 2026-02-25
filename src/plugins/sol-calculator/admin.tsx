"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useAdminAuth } from "@/app/(admin)/admin/layout";
import { defaultCaseTypes, type CaseType } from "./Component";

/**
 * SOL Calculator plugin admin panel.
 * Edit case categories and their statute-of-limitations entries.
 * Persists as `solCaseTypes` in site settings.
 *
 * Embed at /admin/plugins/sol-calculator
 */
export default function SOLCalculatorAdmin() {
  const { pin } = useAdminAuth();
  const [caseTypes, setCaseTypes] = useState<Record<string, CaseType[]>>(defaultCaseTypes);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!pin) return;
    fetch("/api/db/settings", { headers: { "x-admin-pin": pin } })
      .then((r) => r.json())
      .then((data: Record<string, unknown>) => {
        const raw = data.solCaseTypes as Record<string, CaseType[]> | undefined;
        if (raw && Object.keys(raw).length) setCaseTypes(raw);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pin]);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/db/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-pin": pin },
      body: JSON.stringify({ solCaseTypes: caseTypes }),
    });
    setSaving(false);
    setToast(res.ok ? "Saved." : "Save failed.");
    setTimeout(() => setToast(""), 3000);
  };

  // ── Category helpers ───────────────────────────────────────────────────────
  const addCategory = () => {
    const name = `New Category ${Object.keys(caseTypes).length + 1}`;
    setCaseTypes((prev) => ({ ...prev, [name]: [] }));
    setExpanded((prev) => ({ ...prev, [name]: true }));
  };

  const renameCategory = (oldName: string, newName: string) => {
    if (!newName.trim() || newName === oldName) return;
    setCaseTypes((prev) => {
      const entries = Object.entries(prev);
      const idx = entries.findIndex(([k]) => k === oldName);
      entries[idx] = [newName, entries[idx][1]];
      return Object.fromEntries(entries);
    });
    setExpanded((prev) => {
      const next = { ...prev };
      next[newName] = next[oldName];
      delete next[oldName];
      return next;
    });
  };

  const removeCategory = (name: string) => {
    if (!confirm(`Remove category "${name}" and all its entries?`)) return;
    setCaseTypes((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  // ── Entry helpers ──────────────────────────────────────────────────────────
  const addEntry = (cat: string) =>
    setCaseTypes((prev) => ({
      ...prev,
      [cat]: [...prev[cat], { label: "", years: 0, notes: "" }],
    }));

  const updateEntry = (cat: string, idx: number, field: keyof CaseType, value: string | number) =>
    setCaseTypes((prev) => ({
      ...prev,
      [cat]: prev[cat].map((e, i) => (i === idx ? { ...e, [field]: value } : e)),
    }));

  const removeEntry = (cat: string, idx: number) =>
    setCaseTypes((prev) => ({
      ...prev,
      [cat]: prev[cat].filter((_, i) => i !== idx),
    }));

  if (loading) return <div className="text-slate-400 text-sm">Loading…</div>;

  const categories = Object.keys(caseTypes);

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">SOL Calculator</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Edit case categories and statute-of-limitations periods.
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

      {/* Categories */}
      <div className="space-y-3">
        {categories.map((cat) => {
          const isOpen = expanded[cat] ?? false;
          return (
            <div key={cat} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              {/* Category header */}
              <div className="flex items-center gap-2 px-4 py-3">
                <button
                  onClick={() => setExpanded((p) => ({ ...p, [cat]: !isOpen }))}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                <input
                  type="text"
                  defaultValue={cat}
                  onBlur={(e) => renameCategory(cat, e.target.value)}
                  className="flex-1 bg-transparent text-sm font-semibold text-slate-200 focus:outline-none focus:text-white"
                />
                <span className="text-xs text-slate-500 shrink-0">
                  {caseTypes[cat].length} entries
                </span>
                <button
                  onClick={() => removeCategory(cat)}
                  className="p-1 text-slate-600 hover:text-red-400 transition-colors"
                  title="Remove category"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Entries */}
              {isOpen && (
                <div className="border-t border-slate-800 divide-y divide-slate-800/60">
                  {caseTypes[cat].map((entry, idx) => (
                    <div key={idx} className="px-4 py-3 space-y-2">
                      <div className="flex gap-2 items-start">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={entry.label}
                            onChange={(e) => updateEntry(cat, idx, "label", e.target.value)}
                            placeholder="Case type label"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                          />
                          <div className="flex gap-2">
                            <div className="w-24 shrink-0">
                              <p className="text-xs text-slate-500 mb-1">Years (0 = ∞)</p>
                              <input
                                type="number"
                                value={entry.years}
                                min={0}
                                step={1}
                                onChange={(e) => updateEntry(cat, idx, "years", Number(e.target.value))}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-slate-500 mb-1">Notes / legal basis</p>
                              <input
                                type="text"
                                value={entry.notes}
                                onChange={(e) => updateEntry(cat, idx, "notes", e.target.value)}
                                placeholder="E.g. RPC Art. 90 – 20 years"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeEntry(cat, idx)}
                          className="mt-1 p-1.5 text-slate-600 hover:text-red-400 transition-colors shrink-0"
                          title="Remove entry"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="px-4 py-2">
                    <button
                      onClick={() => addEntry(cat)}
                      className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-400 transition-colors py-1"
                    >
                      <Plus size={13} /> Add entry
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add category */}
      <button
        onClick={addCategory}
        className="w-full flex items-center justify-center gap-2 border border-dashed border-slate-700 hover:border-amber-500 text-slate-500 hover:text-amber-400 text-sm py-3 rounded-xl transition-colors"
      >
        <Plus size={15} /> Add Category
      </button>

      <p className="text-xs text-slate-600">
        Changes apply immediately after saving. The calculator on the public site
        will use these values on the next page load.
      </p>
    </div>
  );
}
