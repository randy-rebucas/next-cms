"use client";

import { useState } from "react";
import { Calculator, AlertCircle, CheckCircle } from "lucide-react";

type CaseType = {
  label: string;
  years: number;
  notes: string;
};

const caseTypes: Record<string, CaseType[]> = {
  "Anti-Corruption / Graft": [
    { label: "Plunder (RA 7080)", years: 20, notes: "RA 7080 § 6 – 20 years from commission or discovery" },
    { label: "Malversation (Art. 217 RPC)", years: 15, notes: "RPC – prescribes based on penalty; typically 15–20 yrs" },
    { label: "RA 3019 – Anti-Graft Act", years: 15, notes: "RA 3019 – 15 years from discovery of offense" },
    { label: "Unexplained Wealth (RA 1379)", years: 0, notes: "Imprescriptible under some interpretations" },
  ],
  "Criminal Offenses (RPC)": [
    { label: "Murder / Homicide", years: 20, notes: "RPC Art. 90 – 20 years" },
    { label: "Serious Physical Injuries", years: 10, notes: "RPC Art. 90 – 10 years" },
    { label: "Estafa / Swindling", years: 15, notes: "RPC Art. 90 – 15 years (afflictive penalty)" },
    { label: "Libel", years: 1, notes: "RPC Art. 90 – 1 year" },
  ],
  "Civil Actions": [
    { label: "Written Contract", years: 10, notes: "Civil Code Art. 1144 – 10 years" },
    { label: "Oral Contract", years: 6, notes: "Civil Code Art. 1145 – 6 years" },
    { label: "Quasi-Delict / Tort", years: 4, notes: "Civil Code Art. 1146 – 4 years" },
    { label: "Injury to Rights", years: 4, notes: "Civil Code Art. 1146 – 4 years" },
  ],
  "Labor / Employment": [
    { label: "Illegal Dismissal", years: 4, notes: "Labor Code – 4 years from accrual" },
    { label: "Money Claims (wages)", years: 3, notes: "Labor Code Art. 305 – 3 years" },
    { label: "Unfair Labor Practice", years: 1, notes: "Labor Code Art. 305 – 1 year" },
  ],
  "Election / Administrative": [
    { label: "Election Protest (President/VP)", years: 0, notes: "30 days from proclamation – consult COMELEC rules" },
    { label: "Administrative Case (CSC)", years: 5, notes: "Civil Service rules – generally 5 years" },
    { label: "Ombudsman Administrative", years: 5, notes: "RA 6770 – 5 years from occurrence" },
  ],
};

function addYearsMonths(date: Date, years: number): Date {
  const result = new Date(date);
  const fullYears = Math.floor(years);
  const months = Math.round((years - fullYears) * 12);
  result.setFullYear(result.getFullYear() + fullYears);
  result.setMonth(result.getMonth() + months);
  return result;
}

function daysUntil(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default function SOLCalculator() {
  const [category, setCategory] = useState("");
  const [caseType, setCaseType] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [result, setResult] = useState<null | {
    deadline: Date;
    daysLeft: number;
    caseInfo: CaseType;
  }>(null);

  const selectedCase =
    category && caseType ? caseTypes[category]?.find((c) => c.label === caseType) : null;

  const calculate = () => {
    if (!selectedCase || !incidentDate) return;
    if (selectedCase.years === 0) {
      setResult(null);
      alert(
        "No statute of limitations applies to most felonies in New York. Please consult an attorney for specifics."
      );
      return;
    }
    const incident = new Date(incidentDate);
    const deadline = addYearsMonths(incident, selectedCase.years);
    const daysLeft = daysUntil(deadline);
    setResult({ deadline, daysLeft, caseInfo: selectedCase });
  };

  const reset = () => {
    setCategory("");
    setCaseType("");
    setIncidentDate("");
    setResult(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
          <Calculator size={20} className="text-amber-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Statute of Limitations Calculator</h3>
          <p className="text-xs text-slate-500">Estimate your filing deadline (Philippine Law)</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Case Category
          </label>
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setCaseType(""); setResult(null); }}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-amber-400"
          >
            <option value="">-- Select category --</option>
            {Object.keys(caseTypes).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Case Type */}
        {category && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Case Type</label>
            <select
              value={caseType}
              onChange={(e) => { setCaseType(e.target.value); setResult(null); }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-amber-400"
            >
              <option value="">-- Select type --</option>
              {caseTypes[category].map((c) => (
                <option key={c.label}>{c.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Date */}
        {caseType && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Date of Incident
            </label>
            <input
              type="date"
              value={incidentDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => { setIncidentDate(e.target.value); setResult(null); }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-amber-400"
            />
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={calculate}
            disabled={!selectedCase || !incidentDate}
            className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
          >
            Calculate Deadline
          </button>
          {result && (
            <button
              onClick={reset}
              className="px-4 border border-slate-200 text-slate-500 text-sm rounded-lg hover:bg-slate-50"
            >
              Reset
            </button>
          )}
        </div>

        {/* Result */}
        {result && (
          <div
            className={`rounded-xl p-4 border ${
              result.daysLeft <= 0
                ? "bg-red-50 border-red-200"
                : result.daysLeft <= 90
                ? "bg-amber-50 border-amber-200"
                : "bg-green-50 border-green-200"
            }`}
          >
            <div className="flex items-start gap-3">
              {result.daysLeft <= 0 ? (
                <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold text-slate-800 text-sm">
                  Filing Deadline:{" "}
                  <span
                    className={result.daysLeft <= 0 ? "text-red-600" : "text-green-700"}
                  >
                    {result.deadline.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </p>
                <p className="text-sm mt-1">
                  {result.daysLeft <= 0 ? (
                    <span className="text-red-600 font-medium">
                      ⚠ Deadline has passed by {Math.abs(result.daysLeft)} days. Contact us immediately.
                    </span>
                  ) : (
                    <span className="text-slate-600">
                      You have{" "}
                      <strong
                        className={result.daysLeft <= 90 ? "text-amber-600" : "text-green-700"}
                      >
                        {result.daysLeft} days
                      </strong>{" "}
                      remaining to file.
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {result.caseInfo.notes} · Statute: {result.caseInfo.years} year(s)
                </p>
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-slate-400 italic">
          ⚠ This calculator provides general estimates under Philippine law. Exceptions and special rules may apply.
          Always consult Atty. Baligod for legal advice specific to your case.
        </p>
      </div>
    </div>
  );
}
