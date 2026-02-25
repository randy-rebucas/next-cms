import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Experience } from "@/models/Experience";
import { checkPin, ok, err } from "@/core/auth";

export async function GET() {
  await connectDB();
  const rows = await Experience.find().sort({ sort_order: 1 }).lean();
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  const { year, title, subtitle = "", description = "", sort_order = 0 } = await req.json();
  if (!year || !title) return err("year and title are required");

  await connectDB();
  try {
    const doc = await Experience.create({ year, title, subtitle, description, sort_order });
    return ok(doc.toObject());
  } catch (e) {
    return err(String(e));
  }
}
