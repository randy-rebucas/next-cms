import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Category } from "@/models/Category";
import { checkPin, ok, err } from "@/core/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await checkPin(req);
  if (denied) return denied;
  const { id } = await params;

  const body = await req.json();
  await connectDB();
  try {
    const doc = await Category.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!doc) return err("Not found", 404);
    return ok(doc);
  } catch (e) {
    return err(String(e));
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await checkPin(req);
  if (denied) return denied;
  const { id } = await params;

  await connectDB();
  const doc = await Category.findByIdAndDelete(id).lean();
  if (!doc) return err("Not found", 404);
  return ok({ deleted: true });
}
