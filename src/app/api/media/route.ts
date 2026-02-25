import { NextRequest } from "next/server";
import path from "path";
import fs from "fs";
import db from "@/lib/db";
import { checkPin, ok, err } from "@/lib/api";

interface MediaRow {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  width: number;
  height: number;
  alt: string;
  url: string;
  created_at: string;
}

export async function GET(req: NextRequest) {
  const denied = checkPin(req);
  if (denied) return denied;
  const rows = db.prepare("SELECT * FROM media ORDER BY created_at DESC").all() as MediaRow[];
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const denied = checkPin(req);
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

  const maxBytes = 10 * 1024 * 1024; // 10 MB
  if (file.size > maxBytes) return err("File too large (max 10 MB)");

  // Build upload path: /public/uploads/YYYY/MM/
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const uploadDir = path.join(process.cwd(), "public", "uploads", year, month);
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  // Sanitize filename and make unique
  const ext = path.extname(file.name) || ".bin";
  const base = path.basename(file.name, ext)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .slice(0, 60);
  const unique = `${base}-${Date.now().toString(36)}${ext}`;
  const filePath = path.join(uploadDir, unique);

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  const url = `/uploads/${year}/${month}/${unique}`;
  const alt = formData.get("alt") as string | null;

  const info = db
    .prepare(
      "INSERT INTO media (filename, original_name, mime_type, size_bytes, alt, url) VALUES (?,?,?,?,?,?)"
    )
    .run(unique, file.name, file.type, file.size, alt ?? "", url);

  const row = db.prepare("SELECT * FROM media WHERE id = ?").get(info.lastInsertRowid);
  return ok(row);
}
