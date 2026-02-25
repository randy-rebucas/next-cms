"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import { useAdminAuth } from "@/app/(admin)/admin/layout";
import { defaultConfig, type BookingConfig } from "./Component";

/**
 * Consultation Booking plugin admin panel.
 * Configure available time slots and unavailable (blocked) slots.
 * Persists as `bookingConfig` in site settings.
 */
export default function ConsultationBookingAdmin() {
  const { pin } = useAdminAuth();
  const [config, setConfig] = useState<BookingConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [newSlot, setNewSlot] = useState("");

  useEffect(() => {
    if (!pin) return;
    fetch("/api/db/settings", { headers: { "x-admin-pin": pin } })
      .then((r) => r.json())
      .then((data: Record<string, unknown>) => {
        const raw = data.bookingConfig as BookingConfig | undefined;
        if (raw?.timeSlots?.length) setConfig(raw);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pin]);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/db/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-pin": pin },
      body: JSON.stringify({ bookingConfig: config }),
    });
    setSaving(false);
    setToast(res.ok ? "Saved." : "Save failed.");
    setTimeout(() => setToast(""), 3000);
  };

  const addSlot = () => {
    const slot = newSlot.trim();
    if (!slot || config.timeSlots.includes(slot)) return;
    setConfig((prev) => ({ ...prev, timeSlots: [...prev.timeSlots, slot] }));
    setNewSlot("");
  };

  const removeSlot = (slot: string) => {
    setConfig((prev) => ({
      timeSlots: prev.timeSlots.filter((s) => s !== slot),
      unavailable: prev.unavailable.filter((s) => s !== slot),
    }));
  };

  const toggleUnavailable = (slot: string) => {
    setConfig((prev) => ({
      ...prev,
      unavailable: prev.unavailable.includes(slot)
        ? prev.unavailable.filter((s) => s !== slot)
        : [...prev.unavailable, slot],
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
          <h2 className="text-xl font-bold text-slate-900">Consultation Booking</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {config.timeSlots.length} slots · {config.unavailable.length} blocked
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

      <div>
        <p className="text-xs text-slate-500 mb-3">
          Toggle the lock icon to mark a slot as <strong>unavailable</strong> (shown crossed out to visitors).
        </p>

        {/* Time slot grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {config.timeSlots.map((slot) => {
            const blocked = config.unavailable.includes(slot);
            return (
              <div
                key={slot}
                className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-sm ${
                  blocked ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"
                }`}
              >
                <span className={blocked ? "line-through text-slate-400" : "text-slate-700"}>
                  {slot}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => toggleUnavailable(slot)}
                    title={blocked ? "Mark available" : "Block slot"}
                    className={`text-xs px-2 py-0.5 rounded font-medium transition-colors ${
                      blocked
                        ? "bg-red-100 text-red-600 hover:bg-red-200"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {blocked ? "🔒 Blocked" : "✓ Open"}
                  </button>
                  <button
                    onClick={() => removeSlot(slot)}
                    className="p-1 hover:bg-red-50 rounded text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add slot */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. 5:00 PM"
            value={newSlot}
            onChange={(e) => setNewSlot(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSlot()}
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
          />
          <button
            onClick={addSlot}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={15} /> Add Slot
          </button>
        </div>
      </div>
    </div>
  );
}
