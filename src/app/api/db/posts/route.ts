import { NextRequest } from "next/server";
import db from "@/lib/db";
import { checkPin, ok, err } from "@/lib/api";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // all | draft | published
  let query = "SELECT * FROM posts";
  const params: string[] = [];
  if (status && status !== "all") {
    query += " WHERE status = ?";
    params.push(status);
  }
  query += " ORDER BY created_at DESC";
  const rows = db.prepare(query).all(...params);
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const denied = checkPin(req);
  if (denied) return denied;
  const body = await req.json();
  const { title, content = "", excerpt = "", status = "draft", category = "", author = "Atty. Levi Baligod", read_time = "5 min read", tag_css = "bg-slate-100 text-slate-600" } = body;
  if (!title) return err("title is required");
  const slug =
    (body.slug as string | undefined) ??
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 80) + "-" + Date.now().toString(36);
  try {
    const info = db
      .prepare("INSERT INTO posts (slug,title,content,excerpt,status,category,author,read_time,tag_css) VALUES (?,?,?,?,?,?,?,?,?)")
      .run(slug, title, content, excerpt, status, category, author, read_time, tag_css);
    const row = db.prepare("SELECT * FROM posts WHERE id = ?").get(info.lastInsertRowid);
    return ok(row);
  } catch (e) {
    return err(String(e));
  }
}
