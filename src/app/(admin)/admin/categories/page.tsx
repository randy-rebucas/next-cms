"use client";

import { useAdminAuth } from "@/app/(admin)/admin/layout";
import CptManager from "@/components/admin/CptManager";
import { ICategory } from "@/models/Category";

const FIELDS = [
  { key: "name", label: "Name", type: "text" as const, placeholder: "Anti-Corruption" },
  { key: "description", label: "Description", type: "textarea" as const, placeholder: "Brief description…" },
];

function defaultItem() {
  return { name: "", description: "" };
}

export default function CategoriesAdmin() {
  const { pin } = useAdminAuth();

  return (
    <CptManager<ICategory>
      title="Categories"
      apiBase="/api/db/categories"
      fields={FIELDS}
      defaultItem={defaultItem}
      pin={pin}
      renderRow={(item) => (
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-medium text-white text-sm truncate">{item.name}</span>
          <span className="text-xs text-slate-500 font-mono">{item.slug}</span>
        </div>
      )}
    />
  );
}
