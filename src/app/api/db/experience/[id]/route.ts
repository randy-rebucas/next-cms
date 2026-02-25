import { NextRequest } from "next/server";
import db from "@/lib/db";
import { checkPin, ok, err } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };
const FIELDS = ["year", "title", "subtitle", "description", "sort_order"] as const;

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const row = db.prepare("SELECT * FROM experience_events WHERE id=?").get(id);
  if (!row) return err("Not found", 404);
  return ok(row);
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const denied = checkPin(req);
  if (denied) return denied;
  const { id } = await params;
  const body = await req.json();
  const sets = FIELDS.filter((f) => f in body).map((f) => `${f} = ?`).join(", ");
  const vals = FIELDS.filter((f) => f in body).map((f) => body[f]);
  if (!sets) return err("Nothing to update");
  db.prepare(`UPDATE experience_events SET ${sets} WHERE id=?`).run(...vals, id);
  return ok(db.prepare("SELECT * FROM experience_events WHERE id=?").get(id));
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const denied = checkPin(req);
  if (denied) return denied;
  const { id } = await params;
  db.prepare("DELETE FROM experience_events WHERE id=?").run(id);
  return ok({ deleted: true });
}
