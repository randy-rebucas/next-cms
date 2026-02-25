"use client";

import { useState } from "react";
import SOLCalculator from "./SOLCalculator";
import LegalGlossary from "./LegalGlossary";
import DocumentChecklist from "./DocumentChecklist";
import ConsultationBooking from "./ConsultationBooking";
import CaseEvaluation from "./CaseEvaluation";

const tabs = [
  { id: "sol", label: "SOL Calculator", icon: "⏱" },
  { id: "glossary", label: "Legal Glossary", icon: "📖" },
  { id: "checklist", label: "Doc Checklist", icon: "✅" },
  { id: "booking", label: "Book Consult", icon: "📅" },
  { id: "evaluation", label: "Case Evaluation", icon: "📝" },
];

export default function ToolsSection() {
  const [activeTab, setActiveTab] = useState("sol");

  return (
    <section id="tools" className="bg-slate-50 py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-2">
            Client Tools
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 gold-underline">
            Free Legal Tools
          </h2>
          <p className="text-slate-500 mt-6 max-w-xl mx-auto">
            Use our suite of free tools to get informed, organized, and ready before your consultation.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex overflow-x-auto gap-2 mb-8 pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-amber-300"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active tool */}
        <div className="max-w-3xl mx-auto">
          {activeTab === "sol" && <SOLCalculator />}
          {activeTab === "glossary" && <LegalGlossary />}
          {activeTab === "checklist" && <DocumentChecklist />}
          {activeTab === "booking" && <ConsultationBooking />}
          {activeTab === "evaluation" && <CaseEvaluation />}
        </div>
      </div>
    </section>
  );
}
