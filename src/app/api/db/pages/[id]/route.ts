import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Page } from "@/models/Page";
import { checkPin, ok, err } from "@/core/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await connectDB();
  const doc = await Page.findById(id).lean();
  if (!doc) {
    const bySlug = await Page.findOne({ slug: id }).lean();
    if (!bySlug) return err("Not found", 404);
    return ok(bySlug);
  }
  return ok(doc);
}

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
    const doc = await Page.findByIdAndUpdate(id, body, { new: true }).lean();
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
  const doc = await Page.findByIdAndDelete(id).lean();
  if (!doc) return err("Not found", 404);
  return ok({ deleted: true });
}
