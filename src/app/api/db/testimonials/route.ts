import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Testimonial } from "@/models/Testimonial";
import { checkPin, ok, err } from "@/core/auth";

export async function GET() {
  await connectDB();
  const rows = await Testimonial.find().lean();
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  const { name, case_type = "", rating = 5, text = "", initials = "", color = "bg-slate-600" } = await req.json();
  if (!name) return err("name is required");

  await connectDB();
  try {
    const doc = await Testimonial.create({ name, case_type, rating, text, initials, color });
    return ok(doc.toObject());
  } catch (e) {
    return err(String(e));
  }
}
