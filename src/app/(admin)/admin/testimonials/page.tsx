"use client";

import { useAdminAuth } from "@/app/(admin)/admin/layout";
import CptManager from "@/components/admin/CptManager";

interface Testimonial {
  id: number;
  name: string;
  case_type: string;
  rating: number;
  text: string;
  initials: string;
  color: string;
  status: string;
}

const FIELDS = [
  { key: "name", label: "Client Name", type: "text" as const, placeholder: "Maria Santos" },
  { key: "initials", label: "Initials (avatar)", type: "text" as const, placeholder: "MS" },
  { key: "case_type", label: "Case Type", type: "text" as const, placeholder: "Criminal Defense" },
  {
    key: "rating",
    label: "Rating",
    type: "select" as const,
    options: [
      { label: "5 Stars", value: "5" },
      { label: "4 Stars", value: "4" },
      { label: "3 Stars", value: "3" },
      { label: "2 Stars", value: "2" },
      { label: "1 Star", value: "1" },
    ],
  },
  { key: "text", label: "Testimonial Text", type: "textarea" as const, placeholder: "Write the client's testimonial…" },
  { key: "color", label: "Avatar BG Class", type: "text" as const, placeholder: "bg-amber-600" },
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

function defaultItem(): Partial<Testimonial> {
  return { name: "", initials: "", case_type: "", rating: 5, text: "", color: "bg-amber-600", status: "published" };
}

const STARS = ["", "★", "★★", "★★★", "★★★★", "★★★★★"];

export default function TestimonialsAdmin() {
  const { pin } = useAdminAuth();

  return (
    <CptManager<Testimonial>
      title="Testimonials"
      apiBase="/api/db/testimonials"
      fields={FIELDS}
      defaultItem={defaultItem}
      pin={pin}
      renderRow={(item) => (
        <div className="flex items-center gap-3 min-w-0">
          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${item.color || "bg-amber-600"}`}>
            {item.initials || "?"}
          </span>
          <div className="min-w-0">
            <p className="font-medium text-white text-sm truncate">{item.name || "(unnamed)"}</p>
            <p className="text-xs text-slate-500 truncate">{item.case_type} · <span className="text-amber-400">{STARS[Number(item.rating)] || ""}</span></p>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${item.status === "published" ? "bg-green-900/50 text-green-400" : "bg-slate-700 text-slate-400"}`}>
            {item.status}
          </span>
        </div>
      )}
    />
  );
}
