"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/app/admin/layout";
import PageEditor from "@/components/admin/PageEditor";
import { notFound } from "next/navigation";
import { use } from "react";

interface PageRow {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: "draft" | "published";
  author: string;
  featured_image: string;
  meta_title: string;
  meta_description: string;
  og_image: string;
}

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
