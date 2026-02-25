import { auth } from "@/auth";
import { err, ok, getActivePin } from "@/core/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return err("Unauthorized", 401);

  const pin = await getActivePin();
  return ok({ pin });
}
