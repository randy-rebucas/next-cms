import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Post } from "@/models/Post";
import { checkPin, ok, err } from "@/core/auth";
import { triggerHook } from "@/core/plugins/hooks";
import type { PostPayload } from "@/core/plugins/hooks";

export async function GET(req: NextRequest) {
  const denied = await checkPin(req);
  const isAdmin = !denied;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  await connectDB();
  const filter: Record<string, unknown> = {};
  if (!isAdmin) {
    filter.status = "published";
  } else if (status && status !== "all") {
    filter.status = status;
  }

  const rows = await Post.find(filter).sort({ createdAt: -1 }).lean();
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  const rawBody = await req.json();
  const body = await triggerHook("beforeSavePost", rawBody as PostPayload);
  const {
    title, content = "", excerpt = "", status = "draft",
    category = "", author = "Atty. Levi Baligod",
    read_time = "5 min read", tag_css = "bg-slate-100 text-slate-600",
  } = body;
  if (!title) return err("title is required");

  const slug =
    (body.slug as string | undefined) ??
    title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 80) +
    "-" + Date.now().toString(36);

  await connectDB();
  try {
    const doc = await Post.create({ slug, title, content, excerpt, status, category, author, read_time, tag_css });
    await triggerHook("afterSavePost", doc.toObject() as PostPayload);
    return ok(doc.toObject());
  } catch (e) {
    return err(String(e));
  }
}
