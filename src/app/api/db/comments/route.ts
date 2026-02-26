import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Comment } from "@/models/Comment";
import { Post } from "@/models/Post";
import { Setting } from "@/models/Setting";
import { checkPin, ok, err } from "@/core/auth";
import { rateLimit } from "@/lib/rate-limit";
import { parseBody, CommentCreateSchema } from "@/lib/schemas";
import { sanitizeText } from "@/lib/sanitize";
import { sendCommentNotification } from "@/lib/email";

export async function GET(req: NextRequest) {
  const denied = await checkPin(req);
  const isAdmin = !denied;
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");
  const status = searchParams.get("status");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));

  await connectDB();

  const filter: Record<string, unknown> = {};

  if (postId) filter.post = postId;

  if (!isAdmin) {
    // Public: only approved comments for a specific post
    filter.status = "approved";
  } else if (status && status !== "all") {
    filter.status = status;
  }

  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    Comment.find(filter)
      .sort({ createdAt: isAdmin ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Comment.countDocuments(filter),
  ]);

  return ok({ data: rows, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  // Rate limit comment submissions
  const limited = await rateLimit(req, "comment");
  if (limited) return limited;

  const { data, error } = await parseBody(req, CommentCreateSchema);
  if (error || !data) return err(error ?? "Invalid body");

  // Sanitize user input
  const authorName = sanitizeText(data.authorName);
  const content = sanitizeText(data.content);

  await connectDB();

  // Verify the post exists and is published
  const post = await Post.findById(data.post).lean() as { _id: unknown; title: string; slug: string; status: string } | null;
  if (!post || post.status !== "published") {
    return err("Post not found", 404);
  }

  const comment = await Comment.create({
    post: data.post,
    authorName,
    authorEmail: data.authorEmail.toLowerCase().trim(),
    content,
    status: "pending",
  });

  // Notify admin (fire-and-forget — don't block response)
  try {
    const [adminEmailRow, siteNameRow] = await Promise.all([
      Setting.findOne({ key: "adminEmail" }).lean() as Promise<{ value?: string } | null>,
      Setting.findOne({ key: "siteName" }).lean() as Promise<{ value?: string } | null>,
    ]);

    const adminEmail = adminEmailRow?.value;
    if (adminEmail) {
      sendCommentNotification({
        adminEmail,
        postTitle: post.title,
        postSlug: post.slug as string,
        authorName,
        authorEmail: data.authorEmail,
        commentContent: content,
        siteUrl: siteNameRow?.value || "",
      }).catch(() => {});
    }
  } catch {
    // Non-fatal
  }

  return ok({ ...comment.toObject(), _status: "pending_moderation" });
}
