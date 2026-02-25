import { NextRequest } from "next/server";
import db from "@/lib/db";
import { checkPin, ok, err } from "@/lib/api";

interface Params { id: string }
interface PageRow {
  id: number; slug: string; title: string; content: string; excerpt: string;
  status: string; author: string; featured_image: string;
  meta_title: string; meta_description: string; og_image: string;
  created_at: string; updated_at: string;
}

export async function GET(req: NextRequest, { params }: { params: Promise<Params> }) {
  const { id } = await params;
  const row = db.prepare("SELECT * FROM pages WHERE id = ? OR slug = ?").get(id, id) as PageRow | undefined;
  if (!row) return err("Not found", 404);
  const isAdmin = !checkPin(req);
  if (!isAdmin && row.status !== "published") return err("Not found", 404);
  return ok(row);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<Params> }) {
  const denied = checkPin(req);
  if (denied) return denied;
  const { id } = await params;
  const body = await req.json() as Partial<PageRow>;
  const current = db.prepare("SELECT * FROM pages WHERE id = ?").get(id) as PageRow | undefined;
  if (!current) return err("Not found", 404);

  db.prepare(
    `UPDATE pages SET
      slug=?, title=?, content=?, excerpt=?, status=?, author=?,
      featured_image=?, meta_title=?, meta_description=?, og_image=?,
      updated_at=datetime('now')
     WHERE id=?`
  ).run(
    body.slug ?? current.slug,
    body.title ?? current.title,
    body.content ?? current.content,
    body.excerpt ?? current.excerpt,
    body.status ?? current.status,
    body.author ?? current.author,
    body.featured_image ?? current.featured_image,
    body.meta_title ?? current.meta_title,
    body.meta_description ?? current.meta_description,
    body.og_image ?? current.og_image,
    id
  );
  return ok(db.prepare("SELECT * FROM pages WHERE id = ?").get(id));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<Params> }) {
  const denied = checkPin(req);
  if (denied) return denied;
  const { id } = await params;
  db.prepare("DELETE FROM pages WHERE id = ?").run(id);
  return ok({ deleted: true });
}
