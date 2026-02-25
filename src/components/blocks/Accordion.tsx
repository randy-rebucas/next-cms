"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { AccordionBlock } from "@/models/content";

export default function Accordion({ block }: { block: AccordionBlock }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="my-3 border border-slate-700 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-200 hover:bg-slate-800/60 transition-colors"
      >
        <span>{block.title}</span>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-slate-800">
          <div
            className="text-slate-300 text-sm leading-relaxed pt-3"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        </div>
      )}
    </div>
  );
}
