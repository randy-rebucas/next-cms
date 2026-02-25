"use client";

import { useState } from "react";
import { Calendar, Clock, CheckCircle } from "lucide-react";

export interface BookingConfig {
  timeSlots: string[];
  unavailable: string[];
}

export interface ConsultationBookingProps {
  config?: BookingConfig;
}

export const defaultConfig: BookingConfig = {
  timeSlots: [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "1:00 PM", "1:30 PM",
    "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
    "4:00 PM", "4:30 PM",
  ],
  unavailable: ["9:00 AM", "10:00 AM", "1:30 PM", "3:00 PM"],
};

function getNext7Days() {
  const days: { date: Date; label: string; short: string }[] = [];
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (days.length < 7) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) {
      days.push({
        date: new Date(d),
        label: d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }),
        short: d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" }),
      });
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
}

export default function ConsultationBooking({ config = defaultConfig }: ConsultationBookingProps) {
  const days = getNext7Days();
  const unavailableSet = new Set(config.unavailable);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTime, setSelectedTime] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Consultation Booked!</h3>
        <p className="text-slate-500 text-sm mb-4">
          Your free consultation is scheduled for{" "}
          <strong>{days[selectedDay].label}</strong> at <strong>{selectedTime}</strong>.
        </p>
        <p className="text-slate-500 text-sm">
          A confirmation has been sent to <strong>{form.email}</strong>. We look forward to speaking with you.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setSelectedTime("");
            setForm({ name: "", email: "", phone: "", notes: "" });
          }}
          className="mt-6 text-amber-600 hover:text-amber-500 text-sm font-medium"
        >
          Book another consultation
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <Calendar size={20} className="text-purple-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Book Free Consultation</h3>
          <p className="text-xs text-slate-500">30-min session · No obligation</p>
        </div>
      </div>

      {/* Days */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
          <Calendar size={12} /> Select Date
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {days.map((day, i) => (
            <button
              key={i}
              onClick={() => { setSelectedDay(i); setSelectedTime(""); }}
              className={`shrink-0 flex flex-col items-center px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                selectedDay === i
                  ? "bg-amber-600 border-amber-600 text-white"
                  : "border-slate-200 text-slate-600 hover:border-amber-300"
              }`}
            >
              <span>{day.short.split(" ")[0]}</span>
              <span className="text-base font-bold">{day.short.split(" ")[1]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Time slots */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
          <Clock size={12} /> Select Time
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {config.timeSlots.map((t) => {
            const busy = unavailableSet.has(t);
            return (
              <button
                key={t}
                disabled={busy}
                onClick={() => setSelectedTime(t)}
                className={`py-2 text-xs rounded-lg border font-medium transition-colors ${
                  busy
                    ? "border-slate-100 text-slate-300 cursor-not-allowed"
                    : selectedTime === t
                    ? "bg-amber-600 border-amber-600 text-white"
                    : "border-slate-200 text-slate-600 hover:border-amber-300"
                }`}
              >
                {busy ? <span className="line-through">{t}</span> : t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Form */}
      {selectedTime && (
        <form onSubmit={handleSubmit} className="space-y-3 border-t border-slate-100 pt-5">
          <p className="text-xs text-amber-600 font-semibold">
            📅 {days[selectedDay].label} · ⏰ {selectedTime}
          </p>
          {[
            { id: "name", label: "Full Name", type: "text", placeholder: "Jane Smith" },
            { id: "email", label: "Email", type: "email", placeholder: "jane@email.com" },
            { id: "phone", label: "Phone Number", type: "tel", placeholder: "(555) 123-4567" },
          ].map((f) => (
            <div key={f.id}>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{f.label}</label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                required
                value={form[f.id as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [f.id]: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Brief case description (optional)
            </label>
            <textarea
              rows={2}
              placeholder="Tell us a bit about your matter..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-amber-400"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm py-3 rounded-lg transition-colors"
          >
            Confirm Consultation
          </button>
        </form>
      )}
    </div>
  );
}
