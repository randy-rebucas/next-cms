import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Tag } from "@/models/Tag";
import { checkPin, ok, err } from "@/core/auth";

export async function GET() {
  await connectDB();
  const rows = await Tag.find().sort({ name: 1 }).lean();
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  const { name, slug } = await req.json();
  if (!name || !slug) return err("name and slug are required");

  await connectDB();
  try {
    const doc = await Tag.create({ name, slug });
    return ok(doc.toObject());
  } catch (e) {
    return err(String(e));
  }
}
