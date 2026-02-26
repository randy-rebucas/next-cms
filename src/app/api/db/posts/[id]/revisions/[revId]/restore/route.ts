import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Revision, MAX_REVISIONS_PER_POST } from "@/models/Revision";
import { Post } from "@/models/Post";
import { checkPin, ok, err } from "@/core/auth";
import { triggerHook } from "@/core/plugins/hooks";
import type { PostPayload } from "@/core/plugins/hooks";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; revId: string }> }
) {
  const denied = await checkPin(req);
  if (denied) return denied;
  const { id, revId } = await params;

  await connectDB();

  // Load the revision to restore
  const revision = await Revision.findById(revId).lean() as {
    _id: unknown;
    post: unknown;
    title: string;
    content: unknown;
    excerpt?: string;
    status: string;
    revisionNumber: number;
  } | null;
  if (!revision) return err("Revision not found", 404);
  if (String(revision.post) !== id) return err("Revision does not belong to this post", 400);

  // Save current post state as a new revision before restoring
  const currentPost = await Post.findById(id).lean() as {
    title: string;
    content: unknown;
    excerpt?: string;
    status: string;
    author_name?: string;
  } | null;
  if (!currentPost) return err("Post not found", 404);

  // Get next revision number
  const latest = await Revision.findOne({ post: id }).sort({ revisionNumber: -1 }).lean() as { revisionNumber: number } | null;
  const nextNumber = (latest?.revisionNumber ?? 0) + 1;

  // Save current as revision (before applying restore)
  await Revision.create({
    post: id,
    title: currentPost.title,
    content: currentPost.content,
    excerpt: currentPost.excerpt,
    status: currentPost.status,
    revisionNumber: nextNumber,
    savedBy: currentPost.author_name ?? "system",
  });

  // Prune revisions to keep max
  const allRevisions = await Revision.find({ post: id })
    .sort({ revisionNumber: -1 })
    .select("_id")
    .lean() as { _id: unknown }[];

  if (allRevisions.length > MAX_REVISIONS_PER_POST) {
    const toDelete = allRevisions.slice(MAX_REVISIONS_PER_POST);
    await Revision.deleteMany({ _id: { $in: toDelete.map((r) => r._id) } });
  }

  // Apply the revision's content to the post
  const updatePayload = {
    title: revision.title,
    content: revision.content,
    excerpt: revision.excerpt,
    status: revision.status,
  };

  const processed = await triggerHook("beforeSavePost", updatePayload as PostPayload);
  const updated = await Post.findByIdAndUpdate(id, processed, { new: true }).lean();
  if (!updated) return err("Failed to restore revision", 500);
  await triggerHook("afterSavePost", updated as PostPayload);

  return ok({ ...updated, restored_from_revision: revId });
}
