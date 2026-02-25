"use client";

import { useState } from "react";
import { FileText, CheckCircle } from "lucide-react";

const practiceAreas = [
  "Anti-Corruption / Graft",
  "Malversation / Plunder",
  "Criminal Defense",
  "Civil Litigation",
  "Public Interest Litigation",
  "Infrastructure / Procurement Fraud",
  "Political / Electoral Law",
  "Ombudsman Complaint",
  "Other",
];

export default function CaseEvaluation() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    area: "",
    incidentDate: "",
    description: "",
    priorAttorney: "No",
  });
  const [submitted, setSubmitted] = useState(false);

  const update = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-amber-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Request Received!</h3>
        <p className="text-slate-500 text-sm">
          Thank you, <strong>{form.name}</strong>. We will review your{" "}
          <strong>{form.area}</strong> matter and respond within{" "}
          <strong>24 hours</strong>. Check your inbox at{" "}
          <strong>{form.email}</strong>.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", area: "", incidentDate: "", description: "", priorAttorney: "No" }); }}
          className="mt-6 text-amber-600 hover:text-amber-500 text-sm font-medium"
        >
          Submit another inquiry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
          <FileText size={20} className="text-amber-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Free Case Evaluation</h3>
          <p className="text-xs text-slate-500">Get a response within 24 hours</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="Jane Smith"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email *</label>
            <input
              type="email"
              required
              placeholder="jane@email.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
            <input
              type="tel"
              placeholder="(555) 123-4567"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Practice Area *</label>
            <select
              required
              value={form.area}
              onChange={(e) => update("area", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-amber-400"
            >
              <option value="">-- Select --</option>
              {practiceAreas.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Date of Incident</label>
            <input
              type="date"
              value={form.incidentDate}
              onChange={(e) => update("incidentDate", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Previously worked with an attorney?</label>
            <div className="flex gap-3 mt-2.5">
              {["No", "Yes"].map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="priorAttorney"
                    value={opt}
                    checked={form.priorAttorney === opt}
                    onChange={() => update("priorAttorney", opt)}
                    className="accent-amber-500"
                  />
                  <span className="text-sm text-slate-600">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Describe your situation *
          </label>
          <textarea
            required
            rows={4}
            placeholder="Please provide a brief description of your legal matter, what happened, and the outcome you're seeking..."
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-amber-400"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm py-3 rounded-lg transition-colors"
        >
          Submit for Free Evaluation
        </button>

        <p className="text-xs text-slate-400 text-center">
          All information is confidential. Submitting this form does not establish an attorney-client relationship.
        </p>
      </form>
    </div>
  );
}
