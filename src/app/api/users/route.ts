import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { requirePermission } from "@/core/rbac";
import type { RbacUser, Role } from "@/core/rbac";
import { ok, err } from "@/core/auth";

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
  const user = await getSessionUser();
  const denied = requirePermission(user, "manage_users");
  if (denied) return denied;

  const body = await req.json();
  const { name, email, password, role = "subscriber", permissions = [] } = body;
  if (!name || !email || !password) return err("name, email and password are required");

  const validRoles: Role[] = ["admin", "editor", "author", "subscriber"];
  if (!validRoles.includes(role)) return err("Invalid role");

  const hash = await bcrypt.hash(password as string, 12);
  await connectDB();
  try {
    const doc = await User.create({ name, email, password_hash: hash, role, permissions });
    const result = doc.toObject() as Record<string, unknown>;
    delete result.password_hash;
    return ok(result);
  } catch (e) {
    return err(String(e));
  }
}
