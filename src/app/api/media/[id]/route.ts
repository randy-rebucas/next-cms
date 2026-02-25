import { NextRequest } from "next/server";
import path from "path";
import fs from "fs";
import db from "@/lib/db";
import { checkPin, ok, err } from "@/lib/api";

interface MediaRow {
  id: number;
  filename: string;
  url: string;
  alt: string;
}

interface Params { id: string }

export async function GET(req: NextRequest, { params }: { params: Promise<Params> }) {
  const denied = checkPin(req);
  if (denied) return denied;
  const { id } = await params;
  const row = db.prepare("SELECT * FROM media WHERE id = ?").get(id);
  if (!row) return err("Not found", 404);
  return ok(row);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<Params> }) {
  const denied = checkPin(req);
  if (denied) return denied;
  const { id } = await params;
  const { alt } = await req.json() as { alt: string };
  db.prepare("UPDATE media SET alt = ? WHERE id = ?").run(alt ?? "", id);
  const row = db.prepare("SELECT * FROM media WHERE id = ?").get(id);
  return ok(row);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<Params> }) {
  const denied = checkPin(req);
  if (denied) return denied;
  const { id } = await params;
  const row = db.prepare("SELECT url FROM media WHERE id = ?").get(id) as MediaRow | undefined;
  if (!row) return err("Not found", 404);

  // Delete file from disk
  try {
    const filePath = path.join(process.cwd(), "public", row.url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch { /* file already missing */ }

  db.prepare("DELETE FROM media WHERE id = ?").run(id);
  return ok({ deleted: true });
}
