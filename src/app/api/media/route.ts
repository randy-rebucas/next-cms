import { NextRequest } from "next/server";
import path from "path";
import fs from "fs";
import connectDB from "@/lib/mongoose";
import { Media } from "@/models/Media";
import { checkPin, ok, err } from "@/core/auth";

export async function GET(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  await connectDB();
  const rows = await Media.find().sort({ createdAt: -1 }).lean();
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return err("Expected multipart/form-data");
  }

  const file = formData.get("file") as File | null;
  if (!file) return err("No file provided");

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
  if (!allowed.includes(file.type)) return err("File type not allowed. Use JPEG, PNG, WebP, GIF or SVG.");

  const maxBytes = 10 * 1024 * 1024;
  if (file.size > maxBytes) return err("File too large (max 10 MB)");

  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const uploadDir = path.join(process.cwd(), "public", "uploads", year, month);
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const ext = path.extname(file.name) || ".bin";
  const base = path.basename(file.name, ext)
    .toLowerCase().replace(/[^a-z0-9_-]/g, "-").slice(0, 60);
  const unique = `${base}-${Date.now().toString(36)}${ext}`;
  const filePath = path.join(uploadDir, unique);

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  const url = `/uploads/${year}/${month}/${unique}`;
  const alt = formData.get("alt") as string | null;

  await connectDB();
  const doc = await Media.create({
    filename: unique, original_name: file.name,
    mime_type: file.type, size_bytes: file.size, alt: alt ?? "", url,
  });
  return ok(doc.toObject());
}
