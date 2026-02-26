import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { User } from "@/models/User";
import { Setting } from "@/models/Setting";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { requirePermission } from "@/core/rbac";
import type { RbacUser, Role } from "@/core/rbac";
import { ok, err } from "@/core/auth";
import { parseBody, UserCreateSchema } from "@/lib/schemas";
import { sendWelcomeEmail } from "@/lib/email";

async function getSessionUser() {
  const session = await auth();
  if (!session?.user) return null;
  return session.user as RbacUser;
}

export async function GET() {
  const user = await getSessionUser();
  const denied = requirePermission(user, "manage_users");
  if (denied) return denied;

  await connectDB();
  const rows = await User.find()
    .select("-password_hash")
    .sort({ createdAt: -1 })
    .lean();
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const sessionUser = await getSessionUser();
  const denied = requirePermission(sessionUser, "manage_users");
  if (denied) return denied;

  const { data, error } = await parseBody(req, UserCreateSchema);
  if (error || !data) return err(error ?? "Invalid body");

  const { name, email, password, role = "subscriber", permissions = [] } = data;

  const validRoles: Role[] = ["admin", "editor", "author", "subscriber"];
  if (!validRoles.includes(role)) return err("Invalid role");

  const hash = await bcrypt.hash(password, 12);
  await connectDB();
  try {
    const doc = await User.create({ name, email, password_hash: hash, role, permissions });
    const result = doc.toObject() as Record<string, unknown>;
    delete result.password_hash;

    // Send welcome email (fire-and-forget)
    try {
      const [siteUrlRow, siteNameRow] = await Promise.all([
        Setting.findOne({ key: "siteUrl" }).lean() as Promise<{ value?: string } | null>,
        Setting.findOne({ key: "siteName" }).lean() as Promise<{ value?: string } | null>,
      ]);
      sendWelcomeEmail({
        userEmail: email,
        userName: name,
        role,
        siteUrl: siteUrlRow?.value || "",
        siteName: siteNameRow?.value || "nextCMS",
      }).catch(() => {});
    } catch {
      // Non-fatal
    }

    return ok(result);
  } catch (e) {
    return err(String(e));
  }
}
