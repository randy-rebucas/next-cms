"use client";

import { useAdminAuth } from "@/app/(admin)/admin/layout";
import CptManager from "@/components/admin/CptManager";

interface ExperienceEvent {
  id: number;
  year: string;
  title: string;
  subtitle: string;
  description: string;
  sort_order: number;
}

const FIELDS = [
  { key: "year", label: "Year / Period", type: "text" as const, placeholder: "2018 – Present" },
  { key: "title", label: "Title", type: "text" as const, placeholder: "Senior Partner, Baligod Law Office" },
  { key: "subtitle", label: "Subtitle", type: "text" as const, placeholder: "Makati City, Metro Manila" },
  { key: "description", label: "Description", type: "textarea" as const, placeholder: "Brief description of role…" },
  { key: "sort_order", label: "Sort Order", type: "text" as const, placeholder: "1" },
];

function defaultItem(): Partial<ExperienceEvent> {
  return { year: "", title: "", subtitle: "", description: "", sort_order: 0 };
}

export default function ExperienceAdmin() {
  const { pin } = useAdminAuth();

  return (
    <CptManager<ExperienceEvent>
      title="Experience"
      apiBase="/api/db/experience"
      fields={FIELDS}
      defaultItem={defaultItem}
      pin={pin}
      renderRow={(item) => (
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-mono text-amber-400 shrink-0">{item.year || "—"}</span>
          <span className="font-medium text-white text-sm truncate">{item.title || "(untitled)"}</span>
          {item.subtitle && <span className="text-xs text-slate-500 truncate hidden sm:block">{item.subtitle}</span>}
        </div>
      )}
    />
  );
}
