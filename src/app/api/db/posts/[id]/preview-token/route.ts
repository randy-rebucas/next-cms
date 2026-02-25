import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Post } from "@/models/Post";
import { checkPin, ok, err } from "@/core/auth";
import crypto from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await checkPin(req);
  if (denied) return denied;
  const { id } = await params;

  await connectDB();
  const token = crypto.randomBytes(16).toString("hex");
  const doc = await Post.findByIdAndUpdate(
    id,
    { preview_token: token },
    { new: true }
  ).lean();
  if (!doc) return err("Not found", 404);
  return ok({ preview_token: token });
}
