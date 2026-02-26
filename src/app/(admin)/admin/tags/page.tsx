"use client";

import { useAdminAuth } from "@/app/(admin)/admin/layout";
import CptManager from "@/components/admin/CptManager";
import type { ITag } from "@/models/Tag";

const FIELDS = [
  { key: "name", label: "Tag Name", type: "text" as const, placeholder: "whistleblower" },
];

function defaultItem() {
  return { name: "" };
}

export default function TagsAdmin() {
  const { pin } = useAdminAuth();

  return (
    <CptManager<ITag>
      title="Tags"
      apiBase="/api/db/tags"
      fields={FIELDS}
      defaultItem={defaultItem}
      pin={pin}
      renderRow={(item) => (
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-medium text-white text-sm">{item.name}</span>
          <span className="text-xs text-slate-500 font-mono">#{item.slug}</span>
        </div>
      )}
    />
  );
}
