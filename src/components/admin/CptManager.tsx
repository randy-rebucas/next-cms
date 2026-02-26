"use client";

import { useEffect, useState, type ReactNode } from "react";
import { PlusCircle, Pencil, Trash2, ChevronDown, Check, X, GripVertical } from "lucide-react";

type FieldDef =
  | { key: string; label: string; type: "text" | "textarea" | "select"; options?: { label: string; value: string }[]; placeholder?: string }
  | { key: string; label: string; type: "json"; hint?: string };

interface CptManagerProps<T extends { id: number }> {
  title: string;
  apiBase: string; // e.g. /api/db/practice-areas
  fields: FieldDef[];
  defaultItem: () => Record<string, unknown>;
  renderRow: (item: T) => ReactNode;
  pin: string;
}

export default function CptManager<T extends { id: number }>({
  title,
  apiBase,
  fields,
  defaultItem,
  renderRow,
  pin,
}: CptManagerProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => fetch(apiBase).then((r) => r.json()).then(setItems);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [apiBase]);

  const startNew = () => {
    setForm(defaultItem());
    setEditingId("new");
    setError("");
  };

  const startEdit = (item: T) => {
    setForm({ ...(item as Record<string, unknown>) });
    setEditingId(item.id);
    setError("");
  };

  const cancel = () => { setEditingId(null); setForm({}); setError(""); };

  const setF = (key: string, val: unknown) => setForm((f) => ({ ...f, [key]: val }));

  const saveItem = async () => {
    setSaving(true);
    setError("");
    const isNew = editingId === "new";
    const url = isNew ? apiBase : `${apiBase}/${editingId}`;
    const method = isNew ? "POST" : "PUT";
    // Parse JSON fields before sending
    const payload: Record<string, unknown> = { ...form } as Record<string, unknown>;
    for (const f of fields) {
      if (f.type === "json" && typeof payload[f.key] === "string") {
        try { payload[f.key] = JSON.parse(payload[f.key] as string); } catch { /* leave as-is */ }
      }
    }
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", "x-admin-pin": pin },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      await load();
      setEditingId(null);
      setForm({});
    } else {
      const j = await res.json().catch(() => ({})) as { error?: string };
      setError(j.error ?? "Save failed");
    }
    setSaving(false);
  };

  const del = async (id: number) => {
    if (!confirm("Delete this item?")) return;
    await fetch(`${apiBase}/${id}`, { method: "DELETE", headers: { "x-admin-pin": pin } });
    await load();
    if (editingId === id) cancel();
  };

  const renderField = (f: FieldDef) => {
    const val = (form[f.key] ?? "") as string;
    const base = "w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500";

    if (f.type === "textarea") return (
      <textarea rows={3} value={val} onChange={(e) => setF(f.key, e.target.value)} placeholder={f.placeholder} className={`${base} resize-y`} />
    );

    if (f.type === "select" && f.options) return (
      <select value={val} onChange={(e) => setF(f.key, e.target.value)} className={base}>
        {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );

    if (f.type === "json") {
      const raw = typeof form[f.key] === "string" ? (form[f.key] as string) : JSON.stringify(form[f.key] ?? [], null, 2);
      return (
        <textarea
          rows={4}
          value={raw}
          onChange={(e) => setF(f.key, e.target.value)}
          className={`${base} font-mono text-xs resize-y`}
          placeholder={f.hint}
        />
      );
    }

    return <input type="text" value={val} onChange={(e) => setF(f.key, e.target.value)} placeholder={f.placeholder} className={base} />;
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-slate-400 text-sm mt-1">{items.length} items</p>
        </div>
        {editingId === null && (
          <button
            onClick={startNew}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            <PlusCircle size={16} />
            Add New
          </button>
        )}
      </div>

      {/* New item form */}
      {editingId === "new" && (
        <div className="bg-slate-900 border border-amber-500/40 rounded-xl p-5 mb-5">
          <p className="text-sm font-semibold text-amber-400 mb-4">New Item</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.key} className={f.type === "textarea" || f.type === "json" ? "sm:col-span-2" : ""}>
                <label className="block text-xs font-semibold text-slate-400 mb-1">{f.label}</label>
                {renderField(f)}
              </div>
            ))}
          </div>
          {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
          <div className="flex gap-2 mt-4">
            <button onClick={saveItem} disabled={saving} className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
              <Check size={14} /> {saving ? "Saving…" : "Save"}
            </button>
            <button onClick={cancel} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm px-3 py-2 rounded-lg transition-colors">
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {items.length === 0 && editingId !== "new" && (
          <p className="text-slate-500 text-sm text-center py-12 bg-slate-900 border border-slate-800 rounded-xl">
            No items yet.
          </p>
        )}
        {items.map((item) => (
          <div key={item.id} className={`border rounded-xl overflow-hidden transition-colors ${editingId === item.id ? "border-amber-500/40" : "border-slate-800"}`}>
            {/* Row header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900">
              <div className="flex items-center gap-3 min-w-0">
                <GripVertical size={14} className="text-slate-600 shrink-0" />
                <div className="min-w-0">{renderRow(item)}</div>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-3">
                <button
                  onClick={() => editingId === item.id ? cancel() : startEdit(item)}
                  className="p-1.5 text-slate-400 hover:text-amber-400 transition-colors"
                  title="Edit"
                >
                  {editingId === item.id ? <ChevronDown size={15} className="rotate-180" /> : <Pencil size={15} />}
                </button>
                <button onClick={() => del(item.id)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors" title="Delete">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            {/* Edit form inline */}
            {editingId === item.id && (
              <div className="border-t border-slate-800 px-4 py-4 bg-slate-900/70">
                <div className="grid sm:grid-cols-2 gap-4">
                  {fields.map((f) => (
                    <div key={f.key} className={f.type === "textarea" || f.type === "json" ? "sm:col-span-2" : ""}>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">{f.label}</label>
                      {renderField(f)}
                    </div>
                  ))}
                </div>
                {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
                <div className="flex gap-2 mt-4">
                  <button onClick={saveItem} disabled={saving} className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                    <Check size={14} /> {saving ? "Saving…" : "Save"}
                  </button>
                  <button onClick={cancel} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm px-3 py-2 rounded-lg transition-colors">
                    <X size={14} /> Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
