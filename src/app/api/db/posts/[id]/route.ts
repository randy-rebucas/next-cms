import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Post } from "@/models/Post";
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
  return ok({ deleted: true });
}
