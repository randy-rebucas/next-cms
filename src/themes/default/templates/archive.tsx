import Link from "next/link";
import { ArrowLeft, Clock, ChevronLeft, ChevronRight, Tag, User } from "lucide-react";
import type { ArchivePostRow } from "@/core/content";

export interface PaginationInfo {
  page: number;
  pages: number;
  total: number;
}

export interface ArchiveTemplateProps {
  /** "tag" for tag archives, "blog" for the /blog index listing. */
  kind: "tag" | "blog";
  /** Display name: tag name or archive heading. */
  label: string;
  description?: string;
  posts: ArchivePostRow[];
  pagination?: PaginationInfo;
  /** Base path for pagination links, e.g. /blog/category/law */
  basePath?: string;
}

/**
 * Default theme — category / tag / blog-index archive view.
 * Rendered inside DefaultLayout (Navbar + Footer already provided).
 */
export default function ArchiveTemplate({
  kind,
  label,
  description,
  posts,
  pagination,
  basePath = "",
}: ArchiveTemplateProps) {
  const showPagination = pagination && pagination.pages > 1;

  const backHref  = kind === "blog" ? "/" : "/blog";
  const backLabel = kind === "blog" ? "Back to Home" : "All Articles";

  const kindLabel = kind === "tag" ? "Tag" : "Blog";

  const displayTitle = kind === "tag" ? `#${label}` : label;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 pt-28">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors mb-8"
      >
        <ArrowLeft size={14} /> {backLabel}
      </Link>

      <div className="mb-10">
        <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
          {kind === "tag" ? <Tag size={11} /> : null}
          {kindLabel}
        </span>
        <h1 className="text-3xl font-bold text-white mt-1">
          {displayTitle}
        </h1>
        {description && <p className="text-slate-400 mt-2 text-sm">{description}</p>}
        <p className="text-slate-500 text-xs mt-1">
          {pagination?.total ?? posts.length} article{(pagination?.total ?? posts.length) !== 1 ? "s" : ""}
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-slate-500 text-sm">No articles here yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <div
              key={String(post._id)}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col hover:border-amber-500/30 transition-colors"
            >
              {post.tag_css && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full self-start mb-3 ${post.tag_css}`}
                />
              )}
              <h2 className="font-bold text-white text-lg mb-2 leading-snug">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="text-slate-400 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
              )}
              <div className="mt-auto flex items-center gap-3 text-xs text-slate-500">
                {post.author_name && (
                  <span className="flex items-center gap-1">
                    <User size={11} /> {post.author_name}
                  </span>
                )}
                {post.read_time && (
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> {post.read_time}
                  </span>
                )}
              </div>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-4 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
              >
                Read more →
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-800">
          <Link
            href={pagination.page > 1 ? `${basePath}?page=${pagination.page - 1}` : "#"}
            aria-disabled={pagination.page <= 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              pagination.page <= 1
                ? "border-slate-800 text-slate-600 pointer-events-none"
                : "border-slate-700 text-slate-300 hover:border-amber-500 hover:text-amber-400"
            }`}
          >
            <ChevronLeft size={16} /> Previous
          </Link>

          <span className="text-sm text-slate-500">
            Page {pagination.page} of {pagination.pages}
          </span>

          <Link
            href={pagination.page < pagination.pages ? `${basePath}?page=${pagination.page + 1}` : "#"}
            aria-disabled={pagination.page >= pagination.pages}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              pagination.page >= pagination.pages
                ? "border-slate-800 text-slate-600 pointer-events-none"
                : "border-slate-700 text-slate-300 hover:border-amber-500 hover:text-amber-400"
            }`}
          >
            Next <ChevronRight size={16} />
          </Link>
        </div>
      )}
    </main>
  );
}
