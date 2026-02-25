import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Setting } from "@/models/Setting";
import { checkPin, ok } from "@/core/auth";

export async function GET(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  await connectDB();
  const rows = await Setting.find().lean() as { key: string; value: string }[];
  const result: Record<string, unknown> = {};
  for (const { key, value } of rows) {
    try { result[key] = JSON.parse(value); } catch { result[key] = value; }
  }
  return ok(result);
}

export async function PUT(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  const body: Record<string, unknown> = await req.json();
  await connectDB();

  const ops = Object.entries(body).map(([k, v]) =>
    Setting.findOneAndUpdate(
      { key: k },
      { key: k, value: typeof v === "string" ? v : JSON.stringify(v) },
      { upsert: true, new: true }
    )
  );
  await Promise.all(ops);
  return ok({ saved: true });
}
