import { NextRequest } from "next/server";
import db from "@/lib/db";
import { checkPin, ok, err } from "@/lib/api";

export async function GET() {
  return ok(db.prepare("SELECT * FROM testimonials ORDER BY id").all());
}

export async function POST(req: NextRequest) {
  const denied = checkPin(req);
  if (denied) return denied;
  const { name, case_type = "", rating = 5, text = "", initials = "", color = "bg-slate-600" } = await req.json();
  if (!name) return err("name is required");
  const info = db
    .prepare("INSERT INTO testimonials (name,case_type,rating,text,initials,color) VALUES (?,?,?,?,?,?)")
    .run(name, case_type, rating, text, initials, color);
  return ok(db.prepare("SELECT * FROM testimonials WHERE id=?").get(info.lastInsertRowid));
}
