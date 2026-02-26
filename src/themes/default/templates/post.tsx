import Link from "next/link";
import { ArrowLeft, Clock, User, MessageSquare } from "lucide-react";
import type { PostRow } from "@/core/content";
import type { SiteTheme } from "@/core/themes";
import BlockRenderer from "@/components/blocks";
import { parseBlocks } from "@/models/content";
import connectDB from "@/lib/mongoose";
import { Comment } from "@/models/Comment";
import CommentsList, { type CommentItem } from "@/components/public/CommentsList";
import CommentForm from "@/components/public/CommentForm";
import type { Types } from "mongoose";

export interface PostTemplateProps {
  post: PostRow;
  theme: SiteTheme;
}

async function getApprovedComments(postId: string): Promise<CommentItem[]> {
  try {
    await connectDB();
    const docs = await Comment.find({ post: postId, status: "approved" })
      .sort({ createdAt: 1 })
      .select("_id authorName content createdAt")
      .lean() as { _id: Types.ObjectId; authorName?: string; content?: string; createdAt: Date }[];

    return docs.map((d) => ({
      _id: String(d._id),
      authorName: d.authorName ?? "Anonymous",
      content: d.content ?? "",
      createdAt: d.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

/**
 * Default theme — blog post view.
 * Rendered inside DefaultLayout (Navbar + Footer already provided).
 */
export default async function PostTemplate({ post, theme: _theme }: PostTemplateProps) {
  const postId = String(post._id);
  const comments = await getApprovedComments(postId);

  const date = new Date(post.updatedAt).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 pt-28">
      <Link
        href="/#blog"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors mb-8"
      >
        <ArrowLeft size={14} /> Back to Articles
      </Link>

      {(post.meta?.featured_image as string | undefined) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.meta.featured_image as string}
          alt={post.title}
          className="w-full rounded-2xl object-cover max-h-80 mb-8 bg-slate-800"
        />
      )}

      {post.tag_css && (
        <span
          className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4 ${post.tag_css}`}
        />
      )}

      <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-6">
        {post.title}
      </h1>

      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-8 pb-8 border-b border-slate-800">
        {post.author_name && (
          <span className="flex items-center gap-1.5">
            <User size={13} /> {post.author_name}
          </span>
        )}
        {post.read_time && (
          <span className="flex items-center gap-1.5">
            <Clock size={13} /> {post.read_time}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Clock size={13} /> {date}
        </span>
        <span className="flex items-center gap-1.5 ml-auto">
          <MessageSquare size={13} />
          {comments.length} comment{comments.length !== 1 ? "s" : ""}
        </span>
      </div>

      <BlockRenderer blocks={parseBlocks(post.content)} />

      {/* Comments Section */}
      <section className="mt-16 pt-10 border-t border-slate-800">
        <h2 className="text-xl font-bold text-white mb-6">
          {comments.length > 0
            ? `${comments.length} Comment${comments.length !== 1 ? "s" : ""}`
            : "Comments"}
        </h2>

        <CommentsList comments={comments} />

        <div className="mt-10">
          <h3 className="text-base font-semibold text-white mb-4">Leave a Comment</h3>
          <p className="text-xs text-slate-500 mb-5">
            Your email address will not be published. Your comment will appear after moderation.
          </p>
          <CommentForm postId={postId} />
        </div>
      </section>
    </main>
  );
}
