import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { PracticeArea } from "@/models/PracticeArea";
import { checkPin, ok, err } from "@/core/auth";

export async function GET() {
  await connectDB();
  const rows = await PracticeArea.find().sort({ sort_order: 1 }).lean();
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  const { icon = "📌", title, description = "", bullets = [], color = "border-amber-500", bg = "bg-amber-50" } = await req.json();
  if (!title) return err("title is required");

  await connectDB();
  const max = await PracticeArea.findOne().sort({ sort_order: -1 }).lean();
  const sort_order = ((max as { sort_order?: number } | null)?.sort_order ?? -1) + 1;

  try {
    const doc = await PracticeArea.create({ icon, title, description, bullets, color, bg, sort_order });
    return ok(doc.toObject());
  } catch (e) {
    return err(String(e));
  }
}
