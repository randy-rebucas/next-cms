import { NextRequest } from "next/server";
import db from "@/lib/db";
import { checkPin, ok, err } from "@/lib/api";

export async function GET() {
  const rows = db.prepare("SELECT * FROM tags ORDER BY name ASC").all();
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const denied = checkPin(req);
  if (denied) return denied;
  const { name } = await req.json() as { name: string };
  if (!name) return err("name is required");
  const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);
  try {
    const info = db.prepare("INSERT INTO tags (name, slug) VALUES (?,?)").run(name, slug);
    return ok(db.prepare("SELECT * FROM tags WHERE id = ?").get(info.lastInsertRowid));
  } catch (e) {
    return err(String(e));
  }
}
