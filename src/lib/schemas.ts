/**
 * src/lib/schemas.ts
 *
 * Zod validation schemas for all content entities.
 * Used in API routes before database operations.
 */
import { z } from "zod";

// ── Reusable primitives ───────────────────────────────────────────────────────

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const slug = z
  .string()
  .min(1)
  .max(120)
  .regex(slugPattern, "Slug must be lowercase alphanumeric with hyphens only");

// ── Post ─────────────────────────────────────────────────────────────────────

export const PostCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  slug: slug.optional(),
  content: z.unknown().optional(),
  excerpt: z.string().max(1000).optional(),
  status: z.enum(["draft", "published", "archived"]).optional().default("draft"),
  author: z.string().max(200).optional(),
  author_name: z.string().max(200).optional(),
  read_time: z.string().max(50).optional(),
  tag_css: z.string().max(200).optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  featuredImage: z.string().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export const PostUpdateSchema = PostCreateSchema.partial();

// ── Page ─────────────────────────────────────────────────────────────────────

export const PageCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  slug: slug.optional(),
  content: z.string().optional(),
  excerpt: z.string().max(1000).optional(),
  status: z.enum(["draft", "published", "archived"]).optional().default("draft"),
  author: z.string().max(200).optional(),
  featured_image: z.string().max(500).optional(),
  meta_title: z.string().max(300).optional(),
  meta_description: z.string().max(500).optional(),
  og_image: z.string().max(500).optional(),
});

export const PageUpdateSchema = PageCreateSchema.partial();

// ── Comment ───────────────────────────────────────────────────────────────────

export const CommentCreateSchema = z.object({
  post: z.string().min(1, "Post ID is required"),
  authorName: z.string().min(1, "Name is required").max(200),
  authorEmail: z.string().email("Valid email required").max(300),
  content: z.string().min(1, "Comment cannot be empty").max(5000),
});

export const CommentUpdateSchema = z.object({
  status: z.enum(["approved", "pending", "spam"]),
});

// ── User ──────────────────────────────────────────────────────────────────────

export const UserCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Valid email required").max(300),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
  role: z.enum(["admin", "editor", "author", "subscriber"]).optional().default("subscriber"),
  permissions: z.array(z.string()).optional().default([]),
});

export const UserUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().max(300).optional(),
  password: z.string().min(8).max(128).optional(),
  role: z.enum(["admin", "editor", "author", "subscriber"]).optional(),
  permissions: z.array(z.string()).optional(),
});

// ── Category ──────────────────────────────────────────────────────────────────

export const CategoryCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: slug,
  description: z.string().max(1000).optional(),
  parent: z.string().optional(),
});

export const CategoryUpdateSchema = CategoryCreateSchema.partial();

// ── Tag ───────────────────────────────────────────────────────────────────────

export const TagCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: slug,
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Parse and validate request body with a Zod schema.
 * Returns `{ data }` on success or `{ error }` on failure.
 */
export async function parseBody<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<{ data: T; error?: never } | { data?: never; error: string }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { error: "Invalid JSON body" };
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    const first = result.error.issues[0];
    return { error: `${first.path.join(".")}: ${first.message}` };
  }
  return { data: result.data };
}
