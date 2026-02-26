/**
 * GET  /api/db/menus          — list all menus
 * POST /api/db/menus          — create or upsert a menu by location
 */
import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Menu } from "@/models/Menu";
import { checkPin, ok, err } from "@/core/auth";

export async function GET(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  await connectDB();
  const menus = await Menu.find().sort({ location: 1 }).lean();
  return ok(menus);
}

export async function POST(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  const body = await req.json() as { name?: string; location?: string; items?: unknown[] };
  if (!body.name?.trim() || !body.location?.trim()) {
    return err("'name' and 'location' are required");
  }

  await connectDB();

  const doc = await Menu.findOneAndUpdate(
    { location: body.location.trim() },
    {
      name:     body.name.trim(),
      location: body.location.trim(),
      items:    Array.isArray(body.items) ? body.items : [],
    },
    { upsert: true, new: true, runValidators: true }
  );

  return ok(doc.toObject());
}
