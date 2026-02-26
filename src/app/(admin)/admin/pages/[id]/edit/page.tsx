"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/app/(admin)/admin/layout";
import PageEditor from "@/components/admin/PageEditor";
import { notFound } from "next/navigation";
import { use } from "react";
import type { IPage } from "@/models/Page";

type PageRow = Pick<IPage, "title" | "slug" | "content" | "excerpt" | "author" | "featured_image" | "meta_title" | "meta_description" | "og_image"> & {
  status: "draft" | "published";
};

export default function EditPageAdmin({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { pin } = useAdminAuth();
  const [page, setPage] = useState<PageRow | null | "loading">("loading");

  useEffect(() => {
    if (!pin) return;
    fetch(`/api/db/pages/${id}`, { headers: { "x-admin-pin": pin } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setPage(data ?? null))
      .catch(() => setPage(null));
  }, [id, pin]);

  if (page === "loading") {
    return <div className="text-slate-400 text-sm">Loading…</div>;
  }
  if (page === null) {
    notFound();
  }

  return <PageEditor initial={page} />;
}
