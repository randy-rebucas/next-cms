/**
 * core/content
 * All public-facing content queries in one place.
 * All functions are async and use Mongoose.
 */
import connectDB from "@/lib/mongoose";
import { Post } from "@/models/Post";
import { Page } from "@/models/Page";
import { Category } from "@/models/Category";
import { Tag } from "@/models/Tag";
import { Setting } from "@/models/Setting";
import type { Types } from "mongoose";

// ── Shared row types ─────────────────────────────────────────────────────────

/** Matches the Mongoose IPost schema returned by `.lean()` */
export type PostRow = {
  _id: Types.ObjectId;
  slug: string;
  title: string;
  /** JSON block array or HTML string */
  content: unknown;
  excerpt?: string;
  status: string;
  type: string;
  /** ObjectId ref to User */
  author?: Types.ObjectId;
  /** Plain-text author name for display (legacy / denormalised) */
  author_name?: string;
  categories: Types.ObjectId[];
  tags: Types.ObjectId[];
  /** ObjectId ref to Media */
  featuredImage?: Types.ObjectId;
  /** Arbitrary meta fields: meta_title, meta_description, og_image, etc. */
  meta: Record<string, unknown>;
  read_time?: string;
  tag_css?: string;
  preview_token?: string | null;
  tenantId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

/** Matches IPage — flat string fields kept as-is in the Page model */
export type PageRow = {
  _id: Types.ObjectId;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  status: string;
  author: string;
  featured_image: string;
  meta_title: string;
  meta_description: string;
  og_image: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CategoryRow = {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
};

export type TagRow = {
  _id: Types.ObjectId;
  name: string;
  slug: string;
};

export type ArchivePostRow = Pick<
  PostRow,
  "_id" | "title" | "slug" | "excerpt" | "author_name" | "read_time" | "tag_css" | "categories" | "createdAt"
>;

// ── Query helpers ────────────────────────────────────────────────────────────

export async function getPost(
  slug: string,
  previewToken?: string
): Promise<PostRow | null> {
  await connectDB();
  if (previewToken) {
    const doc = await Post.findOne({
      slug,
      $or: [{ status: "published" }, { preview_token: previewToken }],
    }).lean();
    return (doc as PostRow | null);
  }
  return Post.findOne({ slug, status: "published" }).lean() as Promise<PostRow | null>;
}

export async function getCmsPage(slug: string): Promise<PageRow | null> {
  await connectDB();
  return Page.findOne({ slug, status: "published" }).lean() as Promise<PageRow | null>;
}

export async function getCategory(slug: string): Promise<CategoryRow | null> {
  await connectDB();
  return Category.findOne({ slug }).lean() as Promise<CategoryRow | null>;
}

export async function getTag(slug: string): Promise<TagRow | null> {
  await connectDB();
  return Tag.findOne({ slug }).lean() as Promise<TagRow | null>;
}

/**
 * Find posts belonging to a category (looked up by slug).
 * @param categorySlug — the slug of the category document
 */
export async function getPostsByCategory(
  categorySlug: string
): Promise<ArchivePostRow[]> {
  await connectDB();
  const cat = await Category.findOne({ slug: categorySlug }).lean() as { _id: Types.ObjectId } | null;
  if (!cat) return [];
  return Post.find({ categories: cat._id, status: "published" })
    .select("title slug excerpt author_name read_time tag_css categories createdAt")
    .sort({ createdAt: -1 })
    .lean() as Promise<ArchivePostRow[]>;
}

export async function getPostsByTag(
  tagId: Types.ObjectId
): Promise<ArchivePostRow[]> {
  await connectDB();
  return Post.find({ tags: tagId, status: "published" })
    .select("title slug excerpt author_name read_time tag_css categories createdAt")
    .sort({ createdAt: -1 })
    .lean() as Promise<ArchivePostRow[]>;
}

/** Read the active theme JSON from settings; returns raw parsed object. */
export async function getActiveThemeSettings(): Promise<Record<string, unknown>> {
  try {
    await connectDB();
    const row = await Setting.findOne({ key: "siteTheme" }).lean() as { value?: unknown } | null;
    if (!row?.value) return {};
    // Setting.value is Mixed — may already be a parsed object or a JSON string (legacy)
    if (typeof row.value === "string") {
      return JSON.parse(row.value) as Record<string, unknown>;
    }
    return row.value as Record<string, unknown>;
  } catch {
    return {};
  }
}

// ── URL resolution ───────────────────────────────────────────────────────────

export type RouteType =
  | { kind: "post"; slug: string; preview?: string }
  | { kind: "category"; slug: string }
  | { kind: "tag"; slug: string }
  | { kind: "page"; slug: string }
  | { kind: "not-found" };

/**
 * Determine what kind of content a URL path maps to.
 * Segments = pathname.split("/").filter(Boolean)
 *
 *  blog/<slug>            → post
 *  blog/category/<slug>   → category archive
 *  blog/tag/<slug>        → tag archive
 *  <slug>                 → CMS page
 */
export function resolveRoute(segments: string[], preview?: string): RouteType {
  if (segments[0] === "blog") {
    if (segments[1] === "category" && segments[2]) return { kind: "category", slug: segments[2] };
    if (segments[1] === "tag" && segments[2]) return { kind: "tag", slug: segments[2] };
    if (segments[1]) return { kind: "post", slug: segments[1], preview };
    return { kind: "not-found" };
  }
  if (segments.length === 1) return { kind: "page", slug: segments[0] };
  return { kind: "not-found" };
}
