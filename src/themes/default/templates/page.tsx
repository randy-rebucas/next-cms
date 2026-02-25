import { Clock, User } from "lucide-react";
import type { PageRow } from "@/core/content";
import type { SiteTheme } from "@/core/themes";
import BlockRenderer from "@/components/blocks";
import { parseBlocks } from "@/models/content";

export interface PageTemplateProps {
  page: PageRow;
  theme: SiteTheme;
}

/**
 * Default theme — CMS page view.
 * Rendered inside DefaultLayout (Navbar + Footer already provided).
 */
export default function PageTemplate({ page, theme: _theme }: PageTemplateProps) {
  const date = new Date(page.updatedAt).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 pt-28">
      {page.featured_image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={page.featured_image}
          alt={page.title}
          className="w-full rounded-2xl object-cover max-h-80 mb-8 bg-slate-800"
        />
      )}

      <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-6">
        {page.title}
      </h1>

      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-8 pb-8 border-b border-slate-800">
        {page.author && (
          <span className="flex items-center gap-1.5">
            <User size={13} /> {page.author}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Clock size={13} /> {date}
        </span>
      </div>

      <BlockRenderer blocks={parseBlocks(page.content)} />
    </main>
  );
}
