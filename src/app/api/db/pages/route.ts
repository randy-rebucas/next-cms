import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Page } from "@/models/Page";
import { checkPin, ok, err } from "@/core/auth";

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

  const rows = await Page.find(filter).sort({ updatedAt: -1 }).lean();
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  const body = await req.json() as {
    slug?: string; title: string; content?: string; excerpt?: string; status?: string;
    author?: string; featured_image?: string; meta_title?: string;
    meta_description?: string; og_image?: string;
  };
  if (!body.title) return err("title is required");

  const slug = body.slug || body.title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);

  await connectDB();
  try {
    const doc = await Page.create({
      slug, title: body.title, content: body.content ?? "",
      excerpt: body.excerpt ?? "", status: body.status ?? "draft",
      author: body.author ?? "Atty. Levi Baligod",
      featured_image: body.featured_image ?? "",
      meta_title: body.meta_title ?? "",
      meta_description: body.meta_description ?? "",
      og_image: body.og_image ?? "",
    });
    return ok(doc.toObject());
  } catch (e) {
    return err(String(e));
  }
}
