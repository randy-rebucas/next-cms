import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Post } from "@/models/Post";
import { Page } from "@/models/Page";
import { ok, err } from "@/core/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));

  if (!q || q.length < 2) return err("Query must be at least 2 characters", 400);

  await connectDB();
  const skip = (page - 1) * limit;

  try {
    // Try MongoDB text search first (requires text index)
    const textFilter = { $text: { $search: q }, status: "published" };

    const [postResults, pageResults] = await Promise.all([
      Post.find(textFilter, { score: { $meta: "textScore" } })
        .select("title slug excerpt author_name read_time createdAt")
        .sort({ score: { $meta: "textScore" } })
        .skip(skip)
        .limit(limit)
        .lean(),
      Page.find({ $text: { $search: q }, status: "published" }, { score: { $meta: "textScore" } })
        .select("title slug excerpt meta_description createdAt")
        .sort({ score: { $meta: "textScore" } })
        .skip(skip)
        .limit(Math.max(1, Math.floor(limit / 3)))
        .lean(),
    ]);

    const results = [
      ...postResults.map((p) => ({
        type: "post" as const,
        _id: String(p._id),
        title: p.title,
        slug: p.slug,
        excerpt: (p as Record<string, unknown>).excerpt as string | undefined,
        url: `/blog/${p.slug}`,
        date: (p as Record<string, unknown>).createdAt as Date,
      })),
      ...pageResults.map((p) => ({
        type: "page" as const,
        _id: String(p._id),
        title: p.title,
        slug: p.slug,
        excerpt: (p as Record<string, unknown>).excerpt as string | undefined,
        url: `/${p.slug}`,
        date: (p as Record<string, unknown>).createdAt as Date,
      })),
    ];

    return ok({ results, query: q, page, total: results.length });
  } catch {
    // Fallback to regex search if text index not yet created
    const regexFilter = { title: { $regex: q, $options: "i" }, status: "published" };

    const [postResults, pageResults] = await Promise.all([
      Post.find(regexFilter)
        .select("title slug excerpt author_name read_time createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Page.find({ title: { $regex: q, $options: "i" }, status: "published" })
        .select("title slug excerpt meta_description createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Math.max(1, Math.floor(limit / 3)))
        .lean(),
    ]);

    const results = [
      ...postResults.map((p) => ({
        type: "post" as const,
        _id: String(p._id),
        title: p.title,
        slug: p.slug,
        excerpt: (p as Record<string, unknown>).excerpt as string | undefined,
        url: `/blog/${p.slug}`,
        date: (p as Record<string, unknown>).createdAt as Date,
      })),
      ...pageResults.map((p) => ({
        type: "page" as const,
        _id: String(p._id),
        title: p.title,
        slug: p.slug,
        excerpt: (p as Record<string, unknown>).excerpt as string | undefined,
        url: `/${p.slug}`,
        date: (p as Record<string, unknown>).createdAt as Date,
      })),
    ];

    return ok({ results, query: q, page, total: results.length });
  }
}
