import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Default theme — template-parts/page-header.tsx
 * WordPress: get_template_part('template-parts/page-header') equivalent.
 *
 * Top-of-page header with optional back navigation link.
 * Used by post, page, archive, and search templates.
 */

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
}

export default function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel = "Back",
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors mb-6"
        >
          <ArrowLeft size={14} /> {backLabel}
        </Link>
      )}
      <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-slate-400 mt-2 text-sm">{subtitle}</p>
      )}
    </div>
  );
}
