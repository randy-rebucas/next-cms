import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import db from "@/lib/db";
import { checkPin, ok, err } from "@/lib/api";

interface Params { id: string }

/** Generates (or regenerates) a preview token for a draft post */
export async function POST(req: NextRequest, { params }: { params: Promise<Params> }) {
  const denied = checkPin(req);
  if (denied) return denied;
  const { id } = await params;
  const token = randomUUID();
  const result = db.prepare("UPDATE posts SET preview_token = ? WHERE id = ?").run(token, id);
  if (result.changes === 0) return err("Post not found", 404);
  const post = db.prepare("SELECT id, slug, preview_token FROM posts WHERE id = ?").get(id) as {
    id: number; slug: string; preview_token: string;
  };
  return ok({ token: post.preview_token, url: `/blog/${post.slug}?preview=${post.preview_token}` });
}

/** Revokes the preview token */
export async function DELETE(req: NextRequest, { params }: { params: Promise<Params> }) {
  const denied = checkPin(req);
  if (denied) return denied;
  const { id } = await params;
  db.prepare("UPDATE posts SET preview_token = NULL WHERE id = ?").run(id);
  return ok({ revoked: true });
}
