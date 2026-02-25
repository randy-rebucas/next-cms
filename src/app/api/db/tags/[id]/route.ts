import { NextRequest } from "next/server";
import db from "@/lib/db";
import { checkPin, ok, err } from "@/lib/api";

interface Params { id: string }

export async function GET(_req: NextRequest, { params }: { params: Promise<Params> }) {
  const { id } = await params;
  const row = db.prepare("SELECT * FROM tags WHERE id = ?").get(id);
  if (!row) return err("Not found", 404);
  return ok(row);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<Params> }) {
  const denied = checkPin(req);
  if (denied) return denied;
  const { id } = await params;
  const { name } = await req.json() as { name: string };
  if (!name) return err("name is required");
  const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);
  db.prepare("UPDATE tags SET name=?, slug=? WHERE id=?").run(name, slug, id);
  return ok(db.prepare("SELECT * FROM tags WHERE id = ?").get(id));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<Params> }) {
  const denied = checkPin(req);
  if (denied) return denied;
  const { id } = await params;
  db.prepare("DELETE FROM tags WHERE id = ?").run(id);
  return ok({ deleted: true });
}
