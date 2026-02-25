import { NextRequest } from "next/server";
import db from "@/lib/db";
import { checkPin, ok, err } from "@/lib/api";

interface Params { id: string }

export async function GET(_req: NextRequest, { params }: { params: Promise<Params> }) {
  const { id } = await params;
  const row = db.prepare("SELECT * FROM categories WHERE id = ?").get(id);
  if (!row) return err("Not found", 404);
  return ok(row);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<Params> }) {
  const denied = checkPin(req);
  if (denied) return denied;
  const { id } = await params;
  const body = await req.json() as { name?: string; description?: string };
  const current = db.prepare("SELECT * FROM categories WHERE id = ?").get(id) as { name: string; description: string } | undefined;
  if (!current) return err("Not found", 404);
  const name = body.name ?? current.name;
  const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);
  db.prepare("UPDATE categories SET name=?, slug=?, description=? WHERE id=?")
    .run(name, slug, body.description ?? current.description, id);
  return ok(db.prepare("SELECT * FROM categories WHERE id = ?").get(id));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<Params> }) {
  const denied = checkPin(req);
  if (denied) return denied;
  const { id } = await params;
  db.prepare("DELETE FROM categories WHERE id = ?").run(id);
  return ok({ deleted: true });
}
