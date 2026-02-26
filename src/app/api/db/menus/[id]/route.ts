/**
 * GET    /api/db/menus/[id]   — get single menu
 * PUT    /api/db/menus/[id]   — update menu (name + items)
 * DELETE /api/db/menus/[id]   — delete menu
 */
import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Menu } from "@/models/Menu";
import { checkPin, ok, err } from "@/core/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const denied = await checkPin(req);
  if (denied) return denied;

  const { id } = await ctx.params;
  await connectDB();
  const doc = await Menu.findById(id).lean();
  if (!doc) return err("Menu not found", 404);
  return ok(doc);
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const denied = await checkPin(req);
  if (denied) return denied;

  const { id } = await ctx.params;
  const body = await req.json() as { name?: string; items?: unknown[] };

  await connectDB();
  const update: Record<string, unknown> = {};
  if (body.name?.trim()) update.name = body.name.trim();
  if (Array.isArray(body.items)) update.items = body.items;

  const doc = await Menu.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!doc) return err("Menu not found", 404);
  return ok(doc.toObject());
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const denied = await checkPin(req);
  if (denied) return denied;

  const { id } = await ctx.params;
  await connectDB();
  const doc = await Menu.findByIdAndDelete(id);
  if (!doc) return err("Menu not found", 404);
  return ok({ deleted: id });
}
