import { NextRequest } from "next/server";
import db from "@/lib/db";
import { checkPin, ok, err } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const row = db.prepare("SELECT * FROM practice_areas WHERE id=?").get(id);
  if (!row) return err("Not found", 404);
  return ok(row);
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const denied = checkPin(req);
  if (denied) return denied;
  const { id } = await params;
  const body = await req.json();
  if ("bullets" in body) body.bullets = JSON.stringify(body.bullets);
  const fields = ["icon", "title", "description", "bullets", "color", "bg", "sort_order", "status"] as const;
  const sets = fields.filter((f) => f in body).map((f) => `${f} = ?`).join(", ");
  const vals = fields.filter((f) => f in body).map((f) => body[f]);
  if (!sets) return err("Nothing to update");
  db.prepare(`UPDATE practice_areas SET ${sets} WHERE id=?`).run(...vals, id);
  return ok(db.prepare("SELECT * FROM practice_areas WHERE id=?").get(id));
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const denied = checkPin(req);
  if (denied) return denied;
  const { id } = await params;
  db.prepare("DELETE FROM practice_areas WHERE id=?").run(id);
  return ok({ deleted: true });
}
