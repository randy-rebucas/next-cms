"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useAdminAuth } from "@/app/(admin)/admin/layout";
import { defaultChecklists, type ChecklistData, type ChecklistItem } from "./Component";

/**
 * Document Checklist plugin admin panel.
 * Edit checklist categories and their items.
 * Persists as `checklistData` in site settings.
 */
export default function DocumentChecklistAdmin() {
  const { pin } = useAdminAuth();
  const [data, setData] = useState<ChecklistData>(
    JSON.parse(JSON.stringify(defaultChecklists)) as ChecklistData
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!pin) return;
    fetch("/api/db/settings", { headers: { "x-admin-pin": pin } })
      .then((r) => r.json())
      .then((res: Record<string, unknown>) => {
        const raw = res.checklistData as ChecklistData | undefined;
        if (raw && Object.keys(raw).length) setData(raw);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pin]);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/db/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-pin": pin },
      body: JSON.stringify({ checklistData: data }),
    });
    setSaving(false);
    setToast(res.ok ? "Saved." : "Save failed.");
    setTimeout(() => setToast(""), 3000);
  };

  const addCategory = () => {
    const name = `New Category ${Object.keys(data).length + 1}`;
    setData((prev) => ({ ...prev, [name]: [] }));
    setExpanded((prev) => ({ ...prev, [name]: true }));
  };

  const renameCategory = (oldName: string, newName: string) => {
    if (!newName.trim() || newName === oldName) return;
    const entries = Object.entries(data);
    const idx = entries.findIndex(([k]) => k === oldName);
    if (idx === -1) return;
    entries[idx] = [newName, entries[idx][1]];
    setData(Object.fromEntries(entries));
    setExpanded((prev) => {
      const next = { ...prev };
      delete next[oldName];
      next[newName] = true;
      return next;
    });
  };

  const deleteCategory = (name: string) => {
    setData((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const addItem = (cat: string) => {
    const id = `${cat.slice(0, 2).toLowerCase()}${Date.now()}`;
    const item: ChecklistItem = { id, label: "New item", checked: false };
    setData((prev) => ({ ...prev, [cat]: [...(prev[cat] ?? []), item] }));
  };

  const updateItem = (cat: string, id: string, label: string) => {
    setData((prev) => ({
      ...prev,
      [cat]: prev[cat].map((i) => (i.id === id ? { ...i, label } : i)),
    }));
  };

  const deleteItem = (cat: string, id: string) => {
    setData((prev) => ({
      ...prev,
      [cat]: prev[cat].filter((i) => i.id !== id),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400 p-8">
        <Loader2 size={18} className="animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Document Checklist</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {Object.keys(data).length} categories · {Object.values(data).flat().length} items
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={addCategory}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={15} /> Add Category
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save
          </button>
        </div>
      </div>

      {toast && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2 rounded-lg">
          {toast}
        </div>
      )}

      {/* Categories */}
      <div className="space-y-3">
        {Object.entries(data).map(([cat, items]) => (
          <div key={cat} className="border border-slate-200 rounded-xl overflow-hidden">
            {/* Category header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
              <button
                onClick={() => setExpanded((p) => ({ ...p, [cat]: !p[cat] }))}
                className="text-slate-500 hover:text-slate-700"
              >
                {expanded[cat] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              <input
                type="text"
                defaultValue={cat}
                onBlur={(e) => renameCategory(cat, e.target.value)}
                className="flex-1 bg-transparent font-semibold text-slate-800 text-sm focus:outline-none focus:bg-white focus:border focus:border-amber-300 focus:rounded px-2 py-0.5"
              />
              <span className="text-xs text-slate-400">{items.length} items</span>
              <button
                onClick={() => deleteCategory(cat)}
                className="p-1 hover:bg-red-50 rounded text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Items */}
            {expanded[cat] && (
              <div className="p-3 space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <span className="text-slate-300 text-xs">☐</span>
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => updateItem(cat, item.id, e.target.value)}
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-amber-400"
                    />
                    <button
                      onClick={() => deleteItem(cat, item.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-500 transition-colors shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addItem(cat)}
                  className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-500 mt-1 transition-colors"
                >
                  <Plus size={13} /> Add item
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
