import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Category } from "@/models/Category";
import { checkPin, ok, err } from "@/core/auth";

export async function GET() {
  await connectDB();
  const rows = await Category.find().sort({ name: 1 }).lean();
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  const { name, slug, description = "" } = await req.json();
  if (!name || !slug) return err("name and slug are required");

  await connectDB();
  try {
    const doc = await Category.create({ name, slug, description });
    return ok(doc.toObject());
  } catch (e) {
    return err(String(e));
  }
}
