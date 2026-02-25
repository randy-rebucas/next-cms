import { NextRequest } from "next/server";
import db from "@/lib/db";
import { checkPin, ok, err } from "@/lib/api";

export async function GET(req: NextRequest) {
  const isAdmin = !checkPin(req);
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  let query = "SELECT * FROM pages WHERE 1=1";
  const params: string[] = [];

  if (!isAdmin) {
    query += " AND status = 'published'";
  } else if (status && status !== "all") {
    query += " AND status = ?";
    params.push(status);
  }

  query += " ORDER BY updated_at DESC";
  const rows = db.prepare(query).all(...params);
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const denied = checkPin(req);
  if (denied) return denied;
  const body = await req.json() as {
    slug?: string; title: string; content?: string; excerpt?: string; status?: string;
    author?: string; featured_image?: string; meta_title?: string; meta_description?: string; og_image?: string;
  };
  if (!body.title) return err("title is required");
  const slug = (body.slug || body.title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 80));
  try {
    const info = db.prepare(
      `INSERT INTO pages (slug, title, content, excerpt, status, author, featured_image, meta_title, meta_description, og_image)
       VALUES (?,?,?,?,?,?,?,?,?,?)`
    ).run(
      slug, body.title, body.content ?? "", body.excerpt ?? "", body.status ?? "draft",
      body.author ?? "Atty. Levi Baligod", body.featured_image ?? "",
      body.meta_title ?? "", body.meta_description ?? "", body.og_image ?? ""
    );
    return ok(db.prepare("SELECT * FROM pages WHERE id = ?").get(info.lastInsertRowid));
  } catch (e) {
    return err(String(e));
  }
}
