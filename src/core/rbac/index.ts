/**
 * core/rbac/index.ts
 *
 * Role-Based Access Control — permission matrix and `authorize()` helper.
 *
 * Roles: admin > editor > author > subscriber
 *
 * Usage in API routes / Server Actions:
 *   import { authorize } from "@/core/rbac";
 *   authorize(user, "publish_posts");   // throws 403 if denied
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type Role = "admin" | "editor" | "author" | "subscriber";

export type Permission =
  // Users
  | "manage_users"
  // Settings / appearance
  | "manage_settings"
  | "manage_theme"
  | "manage_plugins"
  // Posts
  | "create_posts"
  | "edit_posts"
  | "edit_own_posts"
  | "delete_posts"
  | "publish_posts"
  // Pages
  | "manage_pages"
  // Media
  | "manage_media"
  | "upload_media"
  // Taxonomy
  | "manage_categories"
  | "manage_tags"
  // Site content (practice areas, experience, FAQ, testimonials)
  | "manage_site_content"
  // Read-only
  | "read_posts";

// ── Permission Matrix ─────────────────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    "manage_users",
    "manage_settings",
    "manage_theme",
    "manage_plugins",
    "create_posts",
    "edit_posts",
    "edit_own_posts",
    "delete_posts",
    "publish_posts",
    "manage_pages",
    "manage_media",
    "upload_media",
    "manage_categories",
    "manage_tags",
    "manage_site_content",
    "read_posts",
  ],
  editor: [
    "create_posts",
    "edit_posts",
    "edit_own_posts",
    "delete_posts",
    "publish_posts",
    "manage_pages",
    "manage_media",
    "upload_media",
    "manage_categories",
    "manage_tags",
    "read_posts",
  ],
  author: [
    "create_posts",
    "edit_own_posts",
    "upload_media",
    "read_posts",
  ],
  subscriber: ["read_posts"],
};

// ── User shape (matches NextAuth session user + DB row) ───────────────────────

export interface RbacUser {
  id: string | number;
  email: string;
  name?: string | null;
  role: Role;
  /** Extra per-user permissions granted on top of role defaults. */
  permissions?: string[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Return all permissions for a user, combining role defaults + explicit grants.
 */
export function getPermissions(user: RbacUser): Permission[] {
  const base: Permission[] = ROLE_PERMISSIONS[user.role] ?? [];
  const extra = (user.permissions ?? []) as Permission[];
  return [...new Set([...base, ...extra])];
}

/**
 * Check whether a user has a specific permission.
 */
export function hasPermission(user: RbacUser, permission: Permission): boolean {
  return getPermissions(user).includes(permission);
}

/**
 * Assert that `user` has `permission` — throws a typed error if denied.
 * Safe to call in API routes: catch and return a 403 response.
 *
 * @example
 * authorize(user, "publish_posts");
 */
export function authorize(user: RbacUser, permission: Permission): void {
  if (!hasPermission(user, permission)) {
    throw new ForbiddenError(
      `User "${user.email}" (role: ${user.role}) lacks permission: ${permission}`
    );
  }
}

/** Thrown by `authorize()` when a user lacks a required permission. */
export class ForbiddenError extends Error {
  readonly status = 403;
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Express-style middleware helper for Next.js API routes.
 * Returns a 403 JSON response if `user` lacks `permission`, or `null` if OK.
 *
 * @example
 * const denied = requirePermission(user, "manage_settings");
 * if (denied) return denied;
 */
export function requirePermission(
  user: RbacUser | null | undefined,
  permission: Permission
): Response | null {
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!hasPermission(user, permission)) {
    return new Response(
      JSON.stringify({ error: "Forbidden", required: permission }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
  return null;
}

export { ROLE_PERMISSIONS };

