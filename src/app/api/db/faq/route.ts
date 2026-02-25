import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { FAQ } from "@/models/FAQ";
import { checkPin, ok, err } from "@/core/auth";

export async function GET() {
  await connectDB();
  const rows = await FAQ.find({ status: "published" }).sort({ sort_order: 1 }).lean();
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  const { question, answer = "", sort_order = 0 } = await req.json();
  if (!question) return err("question is required");

  await connectDB();
  try {
    const doc = await FAQ.create({ question, answer, sort_order });
    return ok(doc.toObject());
  } catch (e) {
    return err(String(e));
  }
}
