import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Comment } from "@/models/Comment";
import { Post } from "@/models/Post";
import { Setting } from "@/models/Setting";
import { checkPin, ok, err } from "@/core/auth";
import { parseBody, CommentUpdateSchema } from "@/lib/schemas";
import { sendCommentApprovalNotification } from "@/lib/email";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await checkPin(req);
  if (denied) return denied;
  const { id } = await params;

  await connectDB();
  const comment = await Comment.findById(id).lean();
  if (!comment) return err("Not found", 404);
  return ok(comment);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await checkPin(req);
  if (denied) return denied;
  const { id } = await params;

  const { data, error } = await parseBody(req, CommentUpdateSchema);
  if (error || !data) return err(error ?? "Invalid body");

  await connectDB();

  const existing = await Comment.findById(id).lean() as {
    _id: unknown;
    status: string;
    authorName?: string;
    authorEmail?: string;
    post: unknown;
  } | null;
  if (!existing) return err("Not found", 404);

  const updated = await Comment.findByIdAndUpdate(id, { status: data.status }, { new: true }).lean();

  // Send approval notification when status changes from non-approved → approved
  if (data.status === "approved" && existing.status !== "approved") {
    try {
      const post = await Post.findById(existing.post).lean() as { title: string; slug: string } | null;
      const siteUrlRow = await Setting.findOne({ key: "siteUrl" }).lean() as { value?: string } | null;
      const siteUrl = siteUrlRow?.value || "";

      if (post && existing.authorEmail && existing.authorName) {
        sendCommentApprovalNotification({
          authorEmail: existing.authorEmail,
          authorName: existing.authorName,
          postTitle: post.title,
          postUrl: `${siteUrl}/blog/${post.slug}`,
        }).catch(() => {});
      }
    } catch {
      // Non-fatal
    }
  }

  return ok(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await checkPin(req);
  if (denied) return denied;
  const { id } = await params;

  await connectDB();
  const doc = await Comment.findByIdAndDelete(id).lean();
  if (!doc) return err("Not found", 404);
  return ok({ deleted: true });
}
