import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Post } from "@/models/Post";
import { Revision, MAX_REVISIONS_PER_POST } from "@/models/Revision";
import { checkPin, ok, err } from "@/core/auth";
import { triggerHook } from "@/core/plugins/hooks";
import type { PostPayload } from "@/core/plugins/hooks";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const denied = await checkPin(req);
  await connectDB();

  const post = await Post.findById(id).lean();
  if (!post) return err("Not found", 404);

  const serialized = post as Record<string, unknown>;
  if (!denied && serialized.status !== "published") {
    const token = req.nextUrl.searchParams.get("preview");
    if (token !== serialized.preview_token) return err("Not found", 404);
  }
  return ok(serialized);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await checkPin(req);
  if (denied) return denied;
  const { id } = await params;

  const rawBody = await req.json();
  const body = await triggerHook("beforeSavePost", rawBody as PostPayload);
  await connectDB();

  try {
    // Snapshot current state as a revision before updating
    const current = await Post.findById(id).lean() as {
      title: string;
      content: unknown;
      excerpt?: string;
      status: string;
      author_name?: string;
    } | null;

    if (current) {
      const latest = await Revision.findOne({ post: id })
        .sort({ revisionNumber: -1 })
        .select("revisionNumber")
        .lean() as { revisionNumber: number } | null;

      const nextNumber = (latest?.revisionNumber ?? 0) + 1;

      await Revision.create({
        post: id,
        title: current.title,
        content: current.content,
        excerpt: current.excerpt,
        status: current.status,
        revisionNumber: nextNumber,
        savedBy: current.author_name ?? "unknown",
      });

      // Prune old revisions to keep within limit
      const allRevisions = await Revision.find({ post: id })
        .sort({ revisionNumber: -1 })
        .select("_id")
        .lean() as { _id: unknown }[];

      if (allRevisions.length > MAX_REVISIONS_PER_POST) {
        const toDelete = allRevisions.slice(MAX_REVISIONS_PER_POST);
        await Revision.deleteMany({ _id: { $in: toDelete.map((r) => r._id) } });
      }
    }

    const doc = await Post.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!doc) return err("Not found", 404);
    await triggerHook("afterSavePost", doc as PostPayload);
    return ok(doc);
  } catch (e) {
    return err(String(e));
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await checkPin(req);
  if (denied) return denied;
  const { id } = await params;

  await connectDB();
  const doc = await Post.findByIdAndDelete(id).lean();
  if (!doc) return err("Not found", 404);

  // Also delete all revisions for this post
  await Revision.deleteMany({ post: id });

  return ok({ deleted: true });
}
