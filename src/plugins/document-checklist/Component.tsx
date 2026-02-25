"use client";

import { useState } from "react";
import { ClipboardList, CheckSquare, Square } from "lucide-react";

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export type ChecklistData = Record<string, ChecklistItem[]>;

export interface DocumentChecklistProps {
  checklists?: ChecklistData;
}

export const defaultChecklists: ChecklistData = {
  "Anti-Corruption": [
    { id: "ac1", label: "Sworn affidavit detailing the corrupt act(s)", checked: false },
    { id: "ac2", label: "Government contracts, vouchers, or disbursement records", checked: false },
    { id: "ac3", label: "COA (Commission on Audit) findings or audit reports", checked: false },
    { id: "ac4", label: "Proof of damage to government (overpricing, ghost deliveries, etc.)", checked: false },
    { id: "ac5", label: "Photos or documentary evidence of anomalies", checked: false },
    { id: "ac6", label: "Names and positions of public officials involved", checked: false },
    { id: "ac7", label: "Correspondence (emails, memos, letters) with officials", checked: false },
    { id: "ac8", label: "List of potential corroborating witnesses", checked: false },
  ],
  "Criminal Defense": [
    { id: "cr1", label: "Copy of the complaint or information filed", checked: false },
    { id: "cr2", label: "Arrest record or warrant of arrest (if any)", checked: false },
    { id: "cr3", label: "Bail bond documents", checked: false },
    { id: "cr4", label: "Timeline of events in your own words", checked: false },
    { id: "cr5", label: "Names and contact info of alibi witnesses", checked: false },
    { id: "cr6", label: "Any evidence contradicting the complainant's account", checked: false },
    { id: "cr7", label: "Police blotter or NBI records (if applicable)", checked: false },
    { id: "cr8", label: "List of questions and concerns for your attorney", checked: false },
  ],
  "Civil Litigation": [
    { id: "cl1", label: "All relevant contracts and agreements", checked: false },
    { id: "cl2", label: "Correspondence with the opposing party", checked: false },
    { id: "cl3", label: "Official receipts, invoices, or proof of payment", checked: false },
    { id: "cl4", label: "Title deeds or property documents (if property dispute)", checked: false },
    { id: "cl5", label: "Prior demand letters sent or received", checked: false },
    { id: "cl6", label: "Financial statements or proof of damages", checked: false },
    { id: "cl7", label: "Witness information", checked: false },
    { id: "cl8", label: "Timeline of relevant events", checked: false },
  ],
  "Ombudsman Complaint": [
    { id: "oc1", label: "Verified complaint (notarized)", checked: false },
    { id: "oc2", label: "Attached supporting affidavits", checked: false },
    { id: "oc3", label: "Documentary evidence (contracts, vouchers, receipts)", checked: false },
    { id: "oc4", label: "Identification of respondent(s) with position and agency", checked: false },
    { id: "oc5", label: "Valid ID of complainant", checked: false },
    { id: "oc6", label: "Filing fee (or motion to litigate as indigent)", checked: false },
    { id: "oc7", label: "Certificate of non-forum shopping", checked: false },
    { id: "oc8", label: "Proof of prior administrative remedies exhausted (if required)", checked: false },
  ],
};

export default function DocumentChecklist({ checklists = defaultChecklists }: DocumentChecklistProps) {
  const [category, setCategory] = useState(Object.keys(checklists)[0] ?? "");
  const [items, setItems] = useState<ChecklistData>(() =>
    JSON.parse(JSON.stringify(checklists)) as ChecklistData
  );

  // Reset items when checklists prop changes (e.g. after admin saves)
  const toggle = (id: string) => {
    setItems((prev) => ({
      ...prev,
      [category]: prev[category].map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    }));
  };

  const resetCategory = () => {
    setItems((prev) => ({
      ...prev,
      [category]: checklists[category].map((i) => ({ ...i, checked: false })),
    }));
  };

  const checked = items[category]?.filter((i) => i.checked).length ?? 0;
  const total = items[category]?.length ?? 0;
  const pct = total > 0 ? Math.round((checked / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
          <ClipboardList size={20} className="text-green-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Document Checklist</h3>
          <p className="text-xs text-slate-500">Know what to bring to your consultation</p>
        </div>
      </div>

      {/* Category selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.keys(checklists).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              category === cat
                ? "bg-amber-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>{checked} of {total} items</span>
          <span>{pct}% ready</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div
            className="bg-amber-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {items[category]?.map((item) => (
          <button
            key={item.id}
            onClick={() => toggle(item.id)}
            className="w-full flex items-center gap-3 text-left p-3 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {item.checked ? (
              <CheckSquare size={18} className="text-green-500 shrink-0" />
            ) : (
              <Square size={18} className="text-slate-300 shrink-0" />
            )}
            <span
              className={`text-sm ${
                item.checked ? "text-slate-400 line-through" : "text-slate-700"
              }`}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {checked > 0 && (
        <button
          onClick={resetCategory}
          className="mt-3 text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          Reset checklist
        </button>
      )}

      {pct === 100 && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 font-medium text-center">
          ✅ You&apos;re ready for your consultation!
        </div>
      )}
    </div>
  );
}
