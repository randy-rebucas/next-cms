/**
 * POST /api/admin/tools/import
 * Accepts the JSON export format and bulk-inserts content.
 * Skips documents whose slug already exists (no overwrite).
 */
import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Post } from "@/models/Post";
import { Page } from "@/models/Page";
import { checkPin, ok, err } from "@/core/auth";

interface ExportPayload {
  version?: string;
  posts?: Record<string, unknown>[];
  pages?: Record<string, unknown>[];
}

export async function POST(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  let body: ExportPayload;
  try {
    body = await req.json() as ExportPayload;
  } catch {
    return err("Invalid JSON");
  }

  if (!body || (!Array.isArray(body.posts) && !Array.isArray(body.pages))) {
    return err("Payload must have a 'posts' or 'pages' array");
  }

  await connectDB();

  const results = { posts: { inserted: 0, skipped: 0 }, pages: { inserted: 0, skipped: 0 } };

  // Import posts
  for (const raw of body.posts ?? []) {
    const slug = String(raw.slug ?? "");
    if (!slug || !raw.title) { results.posts.skipped++; continue; }
    const exists = await Post.exists({ slug });
    if (exists) { results.posts.skipped++; continue; }
    try {
      // Strip MongoDB internal fields so Mongoose generates fresh ones
      const { _id: _a, __v: _b, createdAt: _c, updatedAt: _d, ...clean } = raw as Record<string, unknown>;
      await Post.create(clean);
      results.posts.inserted++;
    } catch {
      results.posts.skipped++;
    }
  }

  // Import pages
  for (const raw of body.pages ?? []) {
    const slug = String(raw.slug ?? "");
    if (!slug || !raw.title) { results.pages.skipped++; continue; }
    const exists = await Page.exists({ slug });
    if (exists) { results.pages.skipped++; continue; }
    try {
      const { _id: _a, __v: _b, createdAt: _c, updatedAt: _d, ...clean } = raw as Record<string, unknown>;
      await Page.create(clean);
      results.pages.inserted++;
    } catch {
      results.pages.skipped++;
    }
  }

  return ok(results);
}
