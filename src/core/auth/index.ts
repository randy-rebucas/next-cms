import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import connectDB from "@/lib/mongoose";
import { Setting } from "@/models/Setting";

/**
 * Derives a deterministic fallback PIN from AUTH_SECRET so the default is
 * never a predictable value like "1234". Falls back to a static dev-only
 * value only when AUTH_SECRET is not configured (local dev without .env).
 */
function deriveFallbackPin(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return "dev-pin-unset";
  return createHash("sha256").update(secret).digest("hex").slice(0, 16);
}

/** Reads the active admin PIN: ADMIN_PIN env var wins, then DB, then derived fallback. */
export async function getActivePin(): Promise<string> {
  if (process.env.ADMIN_PIN) return process.env.ADMIN_PIN;
  try {
    await connectDB();
    const row = await Setting.findOne({ key: "adminPin" }).lean();
    const stored = (row as { value?: string } | null)?.value;
    if (stored) return stored;
  } catch {
    // DB unavailable — fall through to derived default
  }
  return deriveFallbackPin();
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
