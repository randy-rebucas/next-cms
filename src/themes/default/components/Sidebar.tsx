import Link from "next/link";
import { Search, FileText, Tag, FolderOpen } from "lucide-react";
import connectDB from "@/lib/mongoose";
import { Post } from "@/models/Post";
import { Category } from "@/models/Category";
import { Tag as TagModel } from "@/models/Tag";

/**
 * Default theme — components/Sidebar.tsx
 * WordPress: sidebar.php + get_sidebar() equivalent.
 *
 * Self-fetching async server component.
 * Renders Search, Recent Posts, Categories, and Tags widgets.
 * WordPress: register_sidebar('sidebar-1') / dynamic_sidebar('sidebar-1').
 */
export default async function Sidebar() {
  let recentPosts: { slug: string; title: string }[] = [];
  let categories: { slug: string; name: string }[] = [];
  let tags: { slug: string; name: string }[] = [];

  try {
    await connectDB();
    const [postDocs, catDocs, tagDocs] = await Promise.all([
      Post.find({ status: "published" })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title slug")
        .lean() as Promise<{ title: string; slug: string }[]>,
      Category.find()
        .sort({ name: 1 })
        .select("name slug")
        .lean() as Promise<{ name: string; slug: string }[]>,
      TagModel.find()
        .sort({ name: 1 })
        .limit(20)
        .select("name slug")
        .lean() as Promise<{ name: string; slug: string }[]>,
    ]);
    recentPosts = postDocs;
    categories = catDocs;
    tags = tagDocs;
  } catch { /* use empty defaults */ }

  return (
    <aside className="space-y-6">
      {/* Search Widget */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
          Search
        </h3>
        <form method="GET" action="/search" className="flex gap-2">
          <input
            name="q"
            type="search"
            placeholder="Search…"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <button
            type="submit"
            aria-label="Search"
            className="p-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors"
          >
            <Search size={16} />
          </button>
        </form>
      </div>

      {/* Recent Posts Widget */}
      {recentPosts.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <FileText size={14} className="text-amber-400" /> Recent Posts
          </h3>
          <ul className="space-y-2">
            {recentPosts.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="text-sm text-slate-400 hover:text-amber-400 transition-colors line-clamp-2"
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Categories Widget */}
      {categories.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <FolderOpen size={14} className="text-amber-400" /> Categories
          </h3>
          <ul className="space-y-1.5">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/blog/category/${c.slug}`}
                  className="text-sm text-slate-400 hover:text-amber-400 transition-colors"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tags Widget */}
      {tags.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Tag size={14} className="text-amber-400" /> Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <Link
                key={t.slug}
                href={`/blog/tag/${t.slug}`}
                className="text-xs bg-slate-800 hover:bg-amber-600 text-slate-400 hover:text-white px-2 py-1 rounded-full transition-colors"
              >
                #{t.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
