import { NextRequest, NextResponse } from "next/server";

export const ADMIN_PIN = process.env.ADMIN_PIN ?? "1234";

export function checkPin(req: NextRequest): NextResponse | null {
  const pin = req.headers.get("x-admin-pin");
  if (pin !== ADMIN_PIN) {
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
