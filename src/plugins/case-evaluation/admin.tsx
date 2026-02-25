"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Plus, Trash2, GripVertical } from "lucide-react";
import { useAdminAuth } from "@/app/(admin)/admin/layout";
import { defaultPracticeAreas } from "./Component";

/**
 * Case Evaluation plugin admin panel.
 * Edit practice area options shown in the evaluation form dropdown.
 * Persists as `evaluationAreas` in site settings.
 */
export default function CaseEvaluationAdmin() {
  const { pin } = useAdminAuth();
  const [areas, setAreas] = useState<string[]>(defaultPracticeAreas);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [newArea, setNewArea] = useState("");

  useEffect(() => {
    if (!pin) return;
    fetch("/api/db/settings", { headers: { "x-admin-pin": pin } })
      .then((r) => r.json())
      .then((data: Record<string, unknown>) => {
        const raw = data.evaluationAreas as string[] | undefined;
        if (raw?.length) setAreas(raw);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pin]);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/db/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-pin": pin },
      body: JSON.stringify({ evaluationAreas: areas }),
    });
    setSaving(false);
    setToast(res.ok ? "Saved." : "Save failed.");
    setTimeout(() => setToast(""), 3000);
  };

  const addArea = () => {
    const area = newArea.trim();
    if (!area || areas.includes(area)) return;
    setAreas((prev) => [...prev, area]);
    setNewArea("");
  };

  const removeArea = (idx: number) => {
    setAreas((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateArea = (idx: number, val: string) => {
    setAreas((prev) => prev.map((a, i) => (i === idx ? val : a)));
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
          <h2 className="text-xl font-bold text-slate-900">Case Evaluation</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {areas.length} practice area options in the evaluation form
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Save
        </button>
      </div>

      {toast && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2 rounded-lg">
          {toast}
        </div>
      )}

      <p className="text-xs text-slate-500">
        These options appear in the <strong>Practice Area</strong> dropdown of the free case evaluation form.
      </p>

      {/* Area list */}
      <div className="space-y-2">
        {areas.map((area, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <GripVertical size={16} className="text-slate-300 shrink-0" />
            <input
              type="text"
              value={area}
              onChange={(e) => updateArea(idx, e.target.value)}
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={() => removeArea(idx)}
              className="p-2 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-500 transition-colors shrink-0"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Add area */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="e.g. Election Law"
          value={newArea}
          onChange={(e) => setNewArea(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addArea()}
          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
        />
        <button
          onClick={addArea}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={15} /> Add
        </button>
      </div>
    </div>
  );
}
