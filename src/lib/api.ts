import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

/** Reads the active admin PIN: DB setting wins, then ADMIN_PIN env var, then default. */
function getActivePin(): string {
  if (process.env.ADMIN_PIN) return process.env.ADMIN_PIN;
  try {
    const dbPath = path.join(process.cwd(), "data", "baligod.db");
    if (!fs.existsSync(dbPath)) return "1234";
    const db = new Database(dbPath, { readonly: true });
    const row = db.prepare("SELECT value FROM settings WHERE key='adminPin'").get() as { value: string } | undefined;
    db.close();
    return row?.value || "1234";
  } catch {
    return "1234";
  }
}

export function checkPin(req: NextRequest): NextResponse | null {
  const pin = req.headers.get("x-admin-pin");
  if (pin !== getActivePin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export function ok(data: unknown) {
  return NextResponse.json(data);
}

export function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}
