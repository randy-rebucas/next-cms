import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Media } from "@/models/Media";
import { checkPin, ok, err } from "@/core/auth";
import path from "path";
import fs from "fs";

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
    const doc = await Media.findByIdAndUpdate(id, body, { new: true }).lean();
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
  const doc = await Media.findByIdAndDelete(id).lean() as { url?: string } | null;
  if (!doc) return err("Not found", 404);

  // Delete the physical file from disk
  if (doc.url) {
    try {
      const filePath = path.join(process.cwd(), "public", doc.url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch {
      // Non-fatal: DB record is deleted; log silently
    }
  }

  return ok({ deleted: true });
}
