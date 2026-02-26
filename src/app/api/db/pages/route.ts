import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Page } from "@/models/Page";
import { checkPin, ok, err } from "@/core/auth";
import { parseBody, PageCreateSchema } from "@/lib/schemas";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const denied = await checkPin(req);
  const isAdmin = !denied;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q")?.trim();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));

  await connectDB();

  const filter: Record<string, unknown> = {};
  if (!isAdmin) {
    filter.status = "published";
  } else if (status && status !== "all") {
    filter.status = status;
  }

  if (q) {
    filter.title = { $regex: q, $options: "i" };
  }

  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    Page.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
    Page.countDocuments(filter),
  ]);

  // Backwards-compatible: if no pagination params, return plain array
  const hasPagination = searchParams.has("page") || searchParams.has("limit");
  if (!hasPagination) {
    return ok(rows);
  }

  return ok({ data: rows, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "api");
  if (limited) return limited;

  const denied = await checkPin(req);
  if (denied) return denied;

  const { data, error } = await parseBody(req, PageCreateSchema);
  if (error || !data) return err(error ?? "Invalid body");

  const slug = data.slug || data.title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);

  await connectDB();
  try {
    const doc = await Page.create({
      slug,
      title: data.title,
      content: data.content ?? "",
      excerpt: data.excerpt ?? "",
      status: data.status ?? "draft",
      author: data.author ?? "Atty. Levi Baligod",
      featured_image: data.featured_image ?? "",
      meta_title: data.meta_title ?? "",
      meta_description: data.meta_description ?? "",
      og_image: data.og_image ?? "",
    });
    return ok(doc.toObject());
  } catch (e) {
    return err(String(e));
  }
}
