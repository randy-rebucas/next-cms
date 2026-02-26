import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Revision } from "@/models/Revision";
import { checkPin, ok, err } from "@/core/auth";
import { Post } from "@/models/Post";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await checkPin(req);
  if (denied) return denied;
  const { id } = await params;

  await connectDB();

  // Verify post exists
  const post = await Post.findById(id).lean();
  if (!post) return err("Post not found", 404);

  const revisions = await Revision.find({ post: id })
    .select("_id revisionNumber title status savedBy createdAt")
    .sort({ revisionNumber: -1 })
    .lean();

  return ok(revisions);
}
