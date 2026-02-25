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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionUser = await getSessionUser();
  const denied = requirePermission(sessionUser, "manage_users");
  if (denied) return denied;

  const { id } = await params;
  await connectDB();
  const doc = await User.findById(id).select("-password_hash").lean();
  if (!doc) return err("Not found", 404);
  return ok(doc);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionUser = await getSessionUser();
  const denied = requirePermission(sessionUser, "manage_users");
  if (denied) return denied;

  const { id } = await params;
  const { name, email, role, permissions, password } = await req.json() as {
    name?: string; email?: string; role?: Role;
    permissions?: string[]; password?: string;
  };

  const validRoles: Role[] = ["admin", "editor", "author", "subscriber"];
  if (role && !validRoles.includes(role)) return err("Invalid role");

  const update: Record<string, unknown> = {};
  if (name !== undefined) update.name = name;
  if (email !== undefined) update.email = email;
  if (role !== undefined) update.role = role;
  if (permissions !== undefined) update.permissions = permissions;
  if (password) update.password_hash = await bcrypt.hash(password, 12);

  await connectDB();
  try {
    const doc = await User.findByIdAndUpdate(id, update, { new: true })
      .select("-password_hash").lean();
    if (!doc) return err("Not found", 404);
    return ok(doc);
  } catch (e) {
    return err(String(e));
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionUser = await getSessionUser();
  const denied = requirePermission(sessionUser, "manage_users");
  if (denied) return denied;

  const { id } = await params;
  if (sessionUser?.id === id) return err("Cannot delete your own account", 400);

  await connectDB();
  const doc = await User.findByIdAndDelete(id).lean();
  if (!doc) return err("Not found", 404);
  return ok({ deleted: true });
}
