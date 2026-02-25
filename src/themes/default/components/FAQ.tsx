"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FAQItem } from "@/models/content";

const defaultFaqs = [
  {
    q: "How does a free consultation work?",
    a: "During your free initial consultation, we review the facts of your case, explain your legal options under Philippine law, and outline a potential strategy. There is no obligation to hire us. You may book online, by phone, or in person at our Quezon City office.",
  },
  {
    q: "What is the difference between plunder and malversation?",
    a: "Malversation (Article 217, Revised Penal Code) involves a public officer misappropriating public funds entrusted to them. Plunder (RA 7080) involves a public officer amassing ill-gotten wealth of at least ₱50 million through a series of overt criminal acts. Plunder carries a heavier penalty including reclusion perpetua.",
  },
  {
    q: "Who can file a complaint before the Ombudsman?",
    a: "Any person can file a complaint before the Office of the Ombudsman against a public official or employee for acts related to their official duties, including graft, corruption, and misconduct. The complaint must be supported by affidavits and documentary evidence.",
  },
  {
    q: "What is the Sandiganbayan and what cases does it handle?",
    a: "The Sandiganbayan is a special anti-graft court in the Philippines with jurisdiction over criminal and civil cases involving public officials with Salary Grade 27 and above, charged with violations of the Anti-Graft and Corrupt Practices Act (RA 3019), plunder, malversation, and related offenses.",
  },
  {
    q: "How long do I have to file a criminal complaint in the Philippines?",
    a: "Prescriptive periods vary: plunder – 20 years; malversation – depends on the penalty, typically 10–20 years; violations of RA 3019 (anti-graft) – 15 years from discovery. It is critical to consult an attorney as soon as possible to avoid missing filing deadlines.",
  },
  {
    q: "Can I remain anonymous when reporting corruption?",
    a: "While complaints generally require identification, the Ombudsman has mechanisms to protect whistleblowers. Republic Act No. 6981 (Witness Protection Program) provides protection for those who testify against public officials. Atty. Baligod specializes in guiding whistleblowers through this process safely.",
  },
  {
    q: "What is the PDAF or \u2018pork barrel\u2019 scam?",
    a: "The Priority Development Assistance Fund (PDAF) scam involved legislators allegedly channeling their discretionary government funds through Janet Lim-Napoles\u2019 network of fake NGOs, siphoning billions in public money. Atty. Baligod served as lead counsel for the key government whistleblowers in these landmark cases.",
  },
  {
    q: "How do I know if I have a strong anti-corruption case?",
    a: "A strong case requires: (1) clear evidence of a public official's act or omission; (2) proof of damage to government or unjust enrichment; (3) documentary evidence such as contracts, receipts, COA reports, or audit findings; and (4) a complaint filed within the prescriptive period. A consultation with Atty. Baligod can help assess your specific situation.",
  },
] as FAQItem[];

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
              key={i}
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
