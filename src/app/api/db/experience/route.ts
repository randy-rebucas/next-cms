import { NextRequest } from "next/server";
import db from "@/lib/db";
import { checkPin, ok, err } from "@/lib/api";

export async function GET() {
  return ok(db.prepare("SELECT * FROM experience_events ORDER BY sort_order").all());
}

export async function POST(req: NextRequest) {
  const denied = checkPin(req);
  if (denied) return denied;
  const { year, title, subtitle = "", description = "" } = await req.json();
  if (!year || !title) return err("year and title are required");
  const max = (db.prepare("SELECT MAX(sort_order) as m FROM experience_events").get() as { m: number | null }).m ?? -1;
  const info = db
    .prepare("INSERT INTO experience_events (year,title,subtitle,description,sort_order) VALUES (?,?,?,?,?)")
    .run(year, title, subtitle, description, max + 1);
  return ok(db.prepare("SELECT * FROM experience_events WHERE id=?").get(info.lastInsertRowid));
}
