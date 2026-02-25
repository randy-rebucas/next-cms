"use client";

import { useAdminAuth } from "@/app/admin/layout";
import { useState } from "react";
import CptManager from "@/components/admin/CptManager";
import { Sparkles } from "lucide-react";

interface Faq {
  id: number;
  question: string;
  answer: string;
  sort_order: number;
  status: string;
}

// We extend CptManager with an AI generate button via a wrapper
function AiFaqHint({ pin }: { pin: string }) {
  const [q, setQ] = useState("");
  const [ans, setAns] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!q.trim()) return;
    setLoading(true);
    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-pin": pin },
      body: JSON.stringify({ type: "faq_answer", prompt: q }),
    });
    const j = await res.json() as { content?: string; error?: string };
    setAns(j.content ?? j.error ?? "Error generating answer.");
    setLoading(false);
  };

  return (
    <div className="mb-8 p-4 bg-slate-900 border border-slate-800 rounded-xl">
      <p className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2"><Sparkles size={14} /> AI Answer Generator</p>
      <p className="text-xs text-slate-500 mb-3">Type a legal question and generate an answer with AI, then copy it into a new FAQ entry.</p>
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="e.g. What should I do if I am arrested?"
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
        />
        <button
          onClick={generate}
          disabled={loading || !q.trim()}
          className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <Sparkles size={13} /> {loading ? "…" : "Generate"}
        </button>
      </div>
      {ans && (
        <div className="mt-3">
          <p className="text-xs text-slate-400 mb-1">Generated answer (copy to use below):</p>
          <textarea
            readOnly
            value={ans}
            rows={4}
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 resize-y cursor-text"
          />
        </div>
      )}
    </div>
  );
}

const FIELDS = [
  { key: "question", label: "Question", type: "text" as const, placeholder: "What should I do if arrested?" },
  { key: "answer", label: "Answer", type: "textarea" as const, placeholder: "Write the answer…" },
  { key: "sort_order", label: "Sort Order", type: "text" as const, placeholder: "1" },
  {
    key: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { label: "Published", value: "published" },
      { label: "Hidden", value: "hidden" },
    ],
  },
];

function defaultItem(): Partial<Faq> {
  return { question: "", answer: "", sort_order: 0, status: "published" };
}

export default function FaqAdmin() {
  const { pin } = useAdminAuth();

  return (
    <>
      <AiFaqHint pin={pin} />
      <CptManager<Faq>
        title="FAQ"
        apiBase="/api/db/faq"
        fields={FIELDS}
        defaultItem={defaultItem}
        pin={pin}
        renderRow={(item) => (
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-medium text-white text-sm truncate">{item.question || "(no question)"}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${item.status === "published" ? "bg-green-900/50 text-green-400" : "bg-slate-700 text-slate-400"}`}>
              {item.status}
            </span>
          </div>
        )}
      />
    </>
  );
}
