import { NextRequest } from "next/server";
import db from "@/lib/db";
import { checkPin, ok, err } from "@/lib/api";

export async function GET() {
  return ok(db.prepare("SELECT * FROM faqs ORDER BY sort_order").all());
}

export async function POST(req: NextRequest) {
  const denied = checkPin(req);
  if (denied) return denied;
  const { question, answer = "" } = await req.json();
  if (!question) return err("question is required");
  const max = (db.prepare("SELECT MAX(sort_order) as m FROM faqs").get() as { m: number | null }).m ?? -1;
  const info = db.prepare("INSERT INTO faqs (question,answer,sort_order) VALUES (?,?,?)").run(question, answer, max + 1);
  return ok(db.prepare("SELECT * FROM faqs WHERE id=?").get(info.lastInsertRowid));
}
