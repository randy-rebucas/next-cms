import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// Prepared once — reused on every request via the singleton connection
const _pinQuery = db.prepare("SELECT value FROM settings WHERE key='adminPin'");

/** Reads the active admin PIN: ADMIN_PIN env var wins, then DB, then default '1234'. */
function getActivePin(): string {
  if (process.env.ADMIN_PIN) return process.env.ADMIN_PIN;
  try {
    const row = _pinQuery.get() as { value: string } | undefined;
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
