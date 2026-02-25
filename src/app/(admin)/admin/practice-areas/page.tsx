"use client";

import { useAdminAuth } from "@/app/(admin)/admin/layout";
import CptManager from "@/components/admin/CptManager";

interface PracticeArea {
  id: number;
  icon: string;
  title: string;
  description: string;
  bullets: string[] | string;
  color: string;
  bg: string;
  sort_order: number;
  status: string;
}

const FIELDS = [
  { key: "icon", label: "Icon (emoji)", type: "text" as const, placeholder: "⚖️" },
  { key: "title", label: "Title", type: "text" as const, placeholder: "Criminal Law" },
  { key: "description", label: "Description", type: "textarea" as const, placeholder: "Brief description…" },
  {
    key: "bullets",
    label: "Bullet Points (JSON array)",
    type: "json" as const,
    hint: '["Defense representation","Bail applications","Trial advocacy"]',
  },
  { key: "color", label: "Text Color Class", type: "text" as const, placeholder: "text-red-400" },
  { key: "bg", label: "Background Class", type: "text" as const, placeholder: "bg-red-950/30" },
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

function defaultItem(): Partial<PracticeArea> {
  return { icon: "⚖️", title: "", description: "", bullets: "[]", color: "text-amber-400", bg: "bg-amber-950/30", sort_order: 0, status: "published" };
}

export default function PracticeAreasAdmin() {
  const { pin } = useAdminAuth();

  return (
    <CptManager<PracticeArea>
      title="Practice Areas"
      apiBase="/api/db/practice-areas"
      fields={FIELDS}
      defaultItem={defaultItem}
      pin={pin}
      renderRow={(item) => (
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg">{item.icon}</span>
          <span className="font-medium text-white text-sm truncate">{item.title || "(untitled)"}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ml-1 shrink-0 ${item.status === "published" ? "bg-green-900/50 text-green-400" : "bg-slate-700 text-slate-400"}`}>
            {item.status}
          </span>
        </div>
      )}
    />
  );
}
