import Link from "next/link";
import { ArrowLeft, Clock, Tag, User } from "lucide-react";
import type { ArchivePostRow } from "@/core/content";

export interface ArchiveTemplateProps {
  kind: "category" | "tag";
  /** Display name: category name or tag name (without #). */
  label: string;
  description?: string;
  posts: ArchivePostRow[];
}

/**
 * Default theme — category / tag archive view.
 * Rendered inside DefaultLayout (Navbar + Footer already provided).
 */
export default function ArchiveTemplate({
  kind,
  label,
  description,
  posts,
}: ArchiveTemplateProps) {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16 pt-28">
      <Link
        href="/#blog"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors mb-8"
      >
        <ArrowLeft size={14} /> Back to Articles
      </Link>

      <div className="mb-10">
        <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
          {kind === "tag" ? <Tag size={11} /> : null}
          {kind === "category" ? "Category" : "Tag"}
        </span>
        <h1 className="text-3xl font-bold text-white mt-1">
          {kind === "tag" ? `#${label}` : label}
        </h1>
        {description && <p className="text-slate-400 mt-2 text-sm">{description}</p>}
        <p className="text-slate-500 text-xs mt-1">
          {posts.length} article{posts.length !== 1 ? "s" : ""}
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
    </main>
  );
}
