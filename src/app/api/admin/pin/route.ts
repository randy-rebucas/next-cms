import connectDB from "@/lib/mongoose";
import { Setting } from "@/models/Setting";
import { auth } from "@/auth";
import { err, ok } from "@/core/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return err("Unauthorized", 401);

  await connectDB();
  const row = await Setting.findOne({ key: "adminPin" }).lean() as { value?: string } | null;
  const pin = row?.value || process.env.ADMIN_PIN || "1234";
  return ok({ pin });
}
