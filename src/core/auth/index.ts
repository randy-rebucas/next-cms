import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { Setting } from "@/models/Setting";

/** Reads the active admin PIN: ADMIN_PIN env var wins, then DB, then default '1234'. */
async function getActivePin(): Promise<string> {
  if (process.env.ADMIN_PIN) return process.env.ADMIN_PIN;
  try {
    await connectDB();
    const row = await Setting.findOne({ key: "adminPin" }).lean();
    return (row as { value?: string } | null)?.value || "1234";
  } catch {
    return "1234";
  }
}

export async function checkPin(
  req: NextRequest
): Promise<NextResponse | null> {
  const pin = req.headers.get("x-admin-pin");
  const active = await getActivePin();
  if (pin !== active) {
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
