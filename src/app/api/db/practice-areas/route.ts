import { NextRequest } from "next/server";
import db from "@/lib/db";
import { checkPin, ok, err } from "@/lib/api";

export async function GET() {
  return ok(db.prepare("SELECT * FROM practice_areas ORDER BY sort_order").all());
}

export async function POST(req: NextRequest) {
  const denied = checkPin(req);
  if (denied) return denied;
  const { icon = "📌", title, description = "", bullets = [], color = "border-amber-500", bg = "bg-amber-50" } = await req.json();
  if (!title) return err("title is required");
  const max = (db.prepare("SELECT MAX(sort_order) as m FROM practice_areas").get() as { m: number | null }).m ?? -1;
  const info = db
    .prepare("INSERT INTO practice_areas (icon,title,description,bullets,color,bg,sort_order) VALUES (?,?,?,?,?,?,?)")
    .run(icon, title, description, JSON.stringify(bullets), color, bg, max + 1);
  return ok(db.prepare("SELECT * FROM practice_areas WHERE id=?").get(info.lastInsertRowid));
}
