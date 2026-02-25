"use client";

import { useState } from "react";
import { SOLCalculator } from "@/plugins/sol-calculator";
import { LegalGlossary } from "@/plugins/legal-glossary";
import { DocumentChecklist } from "@/plugins/document-checklist";
import { ConsultationBooking } from "@/plugins/consultation-booking";
import { CaseEvaluation } from "@/plugins/case-evaluation";

const ALL_TABS = [
  { id: "sol",        label: "SOL Calculator",  icon: "⏱" },
  { id: "glossary",   label: "Legal Glossary",  icon: "📖" },
  { id: "checklist",  label: "Doc Checklist",   icon: "✅" },
  { id: "booking",    label: "Book Consult",    icon: "📅" },
  { id: "evaluation", label: "Case Evaluation", icon: "📝" },
];

export type TabId = "sol" | "glossary" | "checklist" | "booking" | "evaluation";

export interface EnabledTabs {
  sol: boolean;
  glossary: boolean;
  checklist: boolean;
  booking: boolean;
  evaluation: boolean;
}

export interface ToolsSectionProps {
  enabledTabs?: Partial<EnabledTabs>;
}

export default function ToolsSection({ enabledTabs }: ToolsSectionProps) {
  const tabs = enabledTabs
    ? ALL_TABS.filter((t) => enabledTabs[t.id as TabId] !== false)
    : ALL_TABS;

  const [activeTab, setActiveTab] = useState(() => tabs[0]?.id ?? "sol");

  if (tabs.length === 0) return null;

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
          {activeTab === "sol"        && <SOLCalculator />}
          {activeTab === "glossary"   && <LegalGlossary />}
          {activeTab === "checklist"  && <DocumentChecklist />}
          {activeTab === "booking"    && <ConsultationBooking />}
          {activeTab === "evaluation" && <CaseEvaluation />}
        </div>
      </div>
    </section>
  );
}
