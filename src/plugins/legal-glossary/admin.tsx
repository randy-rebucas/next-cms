"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { useAdminAuth } from "@/app/(admin)/admin/layout";
import { defaultTerms, type GlossaryTerm } from "./Component";

/**
 * Legal Glossary plugin admin panel.
 * Add, edit, and remove glossary terms.
 * Persists as `glossaryTerms` in site settings.
 */
export default function LegalGlossaryAdmin() {
  const { pin } = useAdminAuth();
  const [terms, setTerms] = useState<GlossaryTerm[]>(defaultTerms);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editBuf, setEditBuf] = useState<GlossaryTerm>({ term: "", def: "" });
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!pin) return;
    fetch("/api/db/settings", { headers: { "x-admin-pin": pin } })
      .then((r) => r.json())
      .then((data: Record<string, unknown>) => {
        const raw = data.glossaryTerms as GlossaryTerm[] | undefined;
        if (raw && raw.length) setTerms(raw);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pin]);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/db/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-pin": pin },
      body: JSON.stringify({ glossaryTerms: terms }),
    });
    setSaving(false);
    setToast(res.ok ? "Saved." : "Save failed.");
    setTimeout(() => setToast(""), 3000);
  };

  const addTerm = () => {
    const newTerm: GlossaryTerm = { term: "New Term", def: "Definition here." };
    setTerms((prev) => [...prev, newTerm]);
    const idx = terms.length;
    setEditBuf(newTerm);
    setEditingIdx(idx);
  };

  const removeTerm = (idx: number) => {
    setTerms((prev) => prev.filter((_, i) => i !== idx));
    if (editingIdx === idx) setEditingIdx(null);
  };

  const startEdit = (idx: number) => {
    setEditBuf({ ...terms[idx] });
    setEditingIdx(idx);
  };

  const commitEdit = () => {
    if (editingIdx === null) return;
    if (!editBuf.term.trim()) return;
    setTerms((prev) => prev.map((t, i) => (i === editingIdx ? editBuf : t)));
    setEditingIdx(null);
  };

  const cancelEdit = () => setEditingIdx(null);

  const filtered = search
    ? terms.filter(
        (t) =>
          t.term.toLowerCase().includes(search.toLowerCase()) ||
          t.def.toLowerCase().includes(search.toLowerCase())
      )
    : terms;

  const sorted = [...filtered].sort((a, b) => a.term.localeCompare(b.term));

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
          <h2 className="text-xl font-bold text-slate-900">Legal Glossary</h2>
          <p className="text-sm text-slate-500 mt-0.5">{terms.length} terms defined</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={addTerm}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={15} /> Add Term
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

      {/* Search */}
      <input
        type="text"
        placeholder="Filter terms…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
      />

      {/* Term list */}
      <div className="space-y-2">
        {sorted.map((t) => {
          const realIdx = terms.indexOf(t);
          const isEditing = editingIdx === realIdx;
          return (
            <div
              key={realIdx}
              className={`border rounded-xl p-4 ${isEditing ? "border-amber-300 bg-amber-50/40" : "border-slate-200 bg-white"}`}
            >
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Term</label>
                    <input
                      type="text"
                      value={editBuf.term}
                      onChange={(e) => setEditBuf((b) => ({ ...b, term: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Definition</label>
                    <textarea
                      rows={3}
                      value={editBuf.def}
                      onChange={(e) => setEditBuf((b) => ({ ...b, def: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={commitEdit}
                      className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      <Check size={13} /> Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded-lg transition-colors"
                    >
                      <X size={13} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{t.term}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{t.def}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => startEdit(realIdx)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => removeTerm(realIdx)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
