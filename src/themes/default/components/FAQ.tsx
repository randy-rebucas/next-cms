"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FAQItem } from "@/models/content";

const defaultFaqs: FAQItem[] = [
  {
    id: "faq-default-1",
    q: "How does a free consultation work?",
    a: "During your free initial consultation, we review the facts of your case, explain your legal options, and outline a potential strategy. There is no obligation to hire us. Contact us by phone, email, or through the form on this page to schedule your appointment.",
  },
  {
    id: "faq-default-2",
    q: "How much does it cost to hire an attorney?",
    a: "Legal fees depend on the complexity of the case and the type of service needed. We offer free initial consultations and will provide a clear fee structure before any engagement. Some cases may qualify for contingency fee arrangements — meaning you pay nothing unless we win.",
  },
  {
    id: "faq-default-3",
    q: "How long will my case take?",
    a: "The timeline varies significantly depending on the type of case, court schedules, and whether the matter is settled or goes to trial. During your consultation we will give you a realistic estimate based on the specifics of your situation.",
  },
  {
    id: "faq-default-4",
    q: "What should I bring to my first appointment?",
    a: "Bring any documents related to your case — contracts, correspondence, court notices, photographs, or any other evidence you have. The more information you can share, the better we can assess your situation and advise you on the best course of action.",
  },
  {
    id: "faq-default-5",
    q: "Is everything I tell my attorney confidential?",
    a: "Yes. Attorney-client privilege protects all communications between you and your lawyer. We cannot disclose what you tell us without your consent, with very limited exceptions defined by law. You can speak freely and honestly so we can provide the best possible advice.",
  },
  {
    id: "faq-default-6",
    q: "Do I need an attorney or can I handle my case myself?",
    a: "While you have the right to represent yourself, legal proceedings involve complex rules of procedure and evidence. Even in straightforward matters, an experienced attorney can identify issues you might overlook and significantly improve your outcome. A consultation costs nothing and can help you decide.",
  },
];

export default function FAQ({ faqs = defaultFaqs }: { faqs?: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-white py-24">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-amber-600 font-semibold text-sm uppercase tracking-widest mb-2">
            FAQs
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 gold-underline">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={faq.id || i}
              className={`border rounded-xl overflow-hidden transition-colors ${
                open === i ? "border-amber-400" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <button
                className="w-full flex items-center justify-between px-6 py-4 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span
                  className={`font-medium text-sm sm:text-base ${
                    open === i ? "text-amber-600" : "text-slate-800"
                  }`}
                >
                  {faq.q}
                </span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 ml-4 text-slate-400 transition-transform duration-200 ${
                    open === i ? "rotate-180 text-amber-500" : ""
                  }`}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
