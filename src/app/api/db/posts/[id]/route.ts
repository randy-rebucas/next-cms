import { NextRequest } from "next/server";
import db from "@/lib/db";
import { checkPin, ok, err } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const row = db.prepare("SELECT * FROM posts WHERE id = ? OR slug = ?").get(id, id);
  if (!row) return err("Not found", 404);
  return ok(row);
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const denied = checkPin(req);
  if (denied) return denied;
  const { id } = await params;
  const body = await req.json();
  const fields = ["title", "content", "excerpt", "status", "category", "author", "read_time", "tag_css", "slug"] as const;
  const sets = fields.filter((f) => f in body).map((f) => `${f} = ?`).join(", ");
  const vals = fields.filter((f) => f in body).map((f) => body[f]);
  if (!sets) return err("Nothing to update");
  db.prepare(`UPDATE posts SET ${sets}, updated_at = datetime('now') WHERE id = ?`).run(...vals, id);
  const row = db.prepare("SELECT * FROM posts WHERE id = ?").get(id);
  return ok(row);
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const denied = checkPin(req);
  if (denied) return denied;
  const { id } = await params;
  db.prepare("DELETE FROM posts WHERE id = ?").run(id);
  return ok({ deleted: true });
}
