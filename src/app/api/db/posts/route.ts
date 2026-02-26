import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Post } from "@/models/Post";
import { checkPin, ok, err } from "@/core/auth";
import { triggerHook } from "@/core/plugins/hooks";
import type { PostPayload } from "@/core/plugins/hooks";
import { parseBody, PostCreateSchema } from "@/lib/schemas";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const denied = await checkPin(req);
  const isAdmin = !denied;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q")?.trim();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? (isAdmin ? "20" : "12"), 10)));

  await connectDB();

  const filter: Record<string, unknown> = {};
  if (!isAdmin) {
    filter.status = "published";
  } else if (status && status !== "all") {
    filter.status = status;
  }

  // Search by title (case-insensitive regex)
  if (q) {
    filter.title = { $regex: q, $options: "i" };
  }

  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Post.countDocuments(filter),
  ]);

  // Backwards-compatible: if no pagination params, return plain array
  const hasPagination = searchParams.has("page") || searchParams.has("limit");
  if (!hasPagination && isAdmin) {
    return ok(rows);
  }

  return ok({ data: rows, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "api");
  if (limited) return limited;

  const denied = await checkPin(req);
  if (denied) return denied;

  const { data, error } = await parseBody(req, PostCreateSchema);
  if (error || !data) return err(error ?? "Invalid body");

  const body = await triggerHook("beforeSavePost", data as unknown as PostPayload);
  const {
    title,
    content = "",
    excerpt = "",
    status = "draft",
    author = "Atty. Levi Baligod",
    read_time = "5 min read",
    tag_css = "bg-slate-100 text-slate-600",
  } = body as unknown as typeof data;

  const slug =
    (body.slug as string | undefined) ??
    String(title).toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 80) +
    "-" + Date.now().toString(36);

  await connectDB();
  try {
    const doc = await Post.create({ slug, title, content, excerpt, status, author_name: author, read_time, tag_css });
    await triggerHook("afterSavePost", doc.toObject() as PostPayload);
    return ok(doc.toObject());
  } catch (e) {
    return err(String(e));
  }
}
