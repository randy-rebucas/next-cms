"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Plus, Trash2, Star } from "lucide-react";
import { useAdminAuth } from "@/app/(admin)/admin/layout";
import type { Testimonial } from "@/models/content";
import { defaultReviews } from "./Component";

/**
 * Testimonials plugin admin panel.
 * Manage client testimonials shown on the public home page.
 *
 * Embed at /admin/plugins/testimonials
 */
export default function TestimonialsAdmin() {
  const { pin } = useAdminAuth();
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!pin) return;
    fetch("/api/db/testimonials", { headers: { "x-admin-pin": pin } })
      .then((r) => r.json())
      .then((data: Testimonial[]) => {
        setReviews(Array.isArray(data) && data.length ? data : defaultReviews);
        setLoading(false);
      })
      .catch(() => {
        setReviews(defaultReviews);
        setLoading(false);
      });
  }, [pin]);

  const update = (index: number, key: keyof Testimonial, value: string | number) =>
    setReviews((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [key]: value } : r))
    );

  const remove = (index: number) =>
    setReviews((prev) => prev.filter((_, i) => i !== index));

  const add = () =>
    setReviews((prev) => [
      ...prev,
      { name: "", case: "", rating: 5, text: "", initials: "", color: "bg-amber-600" },
    ] as Testimonial[]);

  const save = async () => {
    setSaving(true);
    // Upsert each testimonial via the API
    const results = await Promise.all(
      reviews.map((r) =>
        fetch("/api/db/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-admin-pin": pin },
          body: JSON.stringify({ ...r, status: "published" }),
        })
      )
    );
    setSaving(false);
    const ok = results.every((r) => r.ok);
    setToast(ok ? "Testimonials saved." : "Some saves failed.");
    setTimeout(() => setToast(""), 3000);
  };

  if (loading) return <div className="text-slate-400 text-sm">Loading…</div>;

  const COLOR_OPTIONS = [
    "bg-blue-600", "bg-rose-600", "bg-green-600",
    "bg-purple-600", "bg-amber-600", "bg-teal-600", "bg-slate-600",
  ];

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Testimonials</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Client reviews shown on the home page.
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

      {/* Cards */}
      <div className="space-y-4">
        {reviews.map((r, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              {/* Avatar preview */}
              <div className={`w-9 h-9 rounded-full ${r.color} flex items-center justify-center text-white text-xs font-bold`}>
                {r.initials || "?"}
              </div>
              <button
                onClick={() => remove(i)}
                className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                title="Remove"
              >
                <Trash2 size={15} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Name" value={r.name} onChange={(v) => update(i, "name", v)} />
              <Field label="Case / Type" value={r.case} onChange={(v) => update(i, "case", v)} />
              <Field label="Initials" value={r.initials} onChange={(v) => update(i, "initials", v)} placeholder="RC" />
              {/* Rating */}
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-1">Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => update(i, "rating", n)}>
                      <Star
                        size={18}
                        className={n <= r.rating ? "fill-amber-400 text-amber-400" : "text-slate-600"}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Testimonial text */}
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1">Testimonial</p>
              <textarea
                value={r.text}
                onChange={(e) => update(i, "text", e.target.value)}
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            {/* Avatar color */}
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-2">Avatar Color</p>
              <div className="flex gap-2 flex-wrap">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => update(i, "color", c)}
                    className={`w-7 h-7 rounded-full ${c} transition-transform ${r.color === c ? "ring-2 ring-white scale-110" : ""}`}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add button */}
      <button
        onClick={add}
        className="w-full flex items-center justify-center gap-2 border border-dashed border-slate-700 hover:border-amber-500 text-slate-500 hover:text-amber-400 text-sm py-3 rounded-xl transition-colors"
      >
        <Plus size={15} /> Add Testimonial
      </button>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder = "",
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
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
    </div>
  );
}
