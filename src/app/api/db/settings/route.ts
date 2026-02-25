import { NextRequest } from "next/server";
import db from "@/lib/db";
import { checkPin, ok } from "@/lib/api";

/** Returns all settings as a flat key→value object — requires PIN to keep secrets safe */
export async function GET(req: NextRequest) {
  const denied = checkPin(req);
  if (denied) return denied;
  const rows = db.prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
  const result: Record<string, unknown> = {};
  for (const { key, value } of rows) {
    try { result[key] = JSON.parse(value); } catch { result[key] = value; }
  }
  return ok(result);
}

/** Upserts key-value pairs from the request body */
export async function PUT(req: NextRequest) {
  const denied = checkPin(req);
  if (denied) return denied;
  const body: Record<string, unknown> = await req.json();
  const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
  const ins = db.transaction((obj: Record<string, unknown>) => {
    for (const [k, v] of Object.entries(obj)) {
      stmt.run(k, typeof v === "string" ? v : JSON.stringify(v));
    }
  });
  ins(body);
  return ok({ saved: true });
}
