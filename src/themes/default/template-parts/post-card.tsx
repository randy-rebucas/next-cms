import Link from "next/link";
import { Clock, User } from "lucide-react";

export interface PostCardData {
  _id: string | { toString(): string };
  title: string;
  slug: string;
  excerpt?: string;
  author_name?: string;
  read_time?: string;
  tag_css?: string;
}

interface PostCardProps {
  post: PostCardData;
}

/**
 * Default theme — template-parts/post-card.tsx
 * WordPress: get_template_part('template-parts/content', 'post') equivalent.
 *
 * Reusable post card used in archive listings, blog widgets, and search results.
 */
export default function PostCard({ post }: PostCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col hover:border-amber-500/30 transition-colors">
      {post.tag_css && (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full self-start mb-3 ${post.tag_css}`} />
      )}

      <h2 className="font-bold text-white text-lg mb-2 leading-snug">{post.title}</h2>

      {post.excerpt && (
        <p className="text-slate-400 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
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
  );
}
