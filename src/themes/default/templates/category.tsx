/**
 * Default theme — category archive template.
 * WordPress equivalent: category.php → archive.php (hierarchy fallback)
 *
 * Rendered inside DefaultLayout (Navbar + Footer already provided).
 * Used by the theme loader for /blog/category/<slug> routes.
 */
import Link from "next/link";
import { ArrowLeft, Clock, ChevronLeft, ChevronRight, FolderOpen, User } from "lucide-react";
import type { ArchivePostRow } from "@/core/content";

export interface PaginationInfo {
  page: number;
  pages: number;
  total: number;
}

export interface CategoryTemplateProps {
  name: string;
  slug: string;
  description?: string;
  posts: ArchivePostRow[];
  pagination?: PaginationInfo;
  /** Base path for pagination links, e.g. /blog/category/law */
  basePath?: string;
}

export default function CategoryTemplate({
  name,
  description,
  posts,
  pagination,
  basePath = "",
}: CategoryTemplateProps) {
  const showPagination = pagination && pagination.pages > 1;
  const total = pagination?.total ?? posts.length;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 pt-28">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors mb-8"
      >
        <ArrowLeft size={14} /> All Articles
      </Link>

      {/* Category header */}
      <div className="mb-12 pb-8 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-amber-600/10 rounded-lg">
            <FolderOpen size={20} className="text-amber-500" />
          </div>
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
            Category
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{name}</h1>
        {description && (
          <p className="text-slate-400 leading-relaxed max-w-2xl">{description}</p>
        )}
        <p className="text-slate-500 text-sm mt-3">
          {total} article{total !== 1 ? "s" : ""} in this category
        </p>
      </div>

      {/* Post grid */}
      {posts.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen size={40} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500">No articles in this category yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <div
              key={String(post._id)}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col hover:border-amber-500/30 transition-colors group"
            >
              {post.tag_css && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full self-start mb-3 ${post.tag_css}`}
                />
              )}
              <h2 className="font-bold text-white text-lg mb-2 leading-snug group-hover:text-amber-300 transition-colors">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="text-slate-400 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
              )}
              <div className="mt-auto flex items-center gap-3 text-xs text-slate-500 mb-4">
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
                <span className="ml-auto">
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <Link
                href={`/blog/${post.slug}`}
                className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
              >
                Read article →
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
