/**
 * Migration script: rewrites all API route files from SQLite to Mongoose.
 * Run: node scripts/migrate-routes.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function write(relPath, content) {
  const full = path.join(root, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf-8");
  console.log("  wrote:", relPath);
}

// ─────────────────────────────────────────────────────────────────────────────
// /api/db/posts/route.ts
// ─────────────────────────────────────────────────────────────────────────────
write("src/app/api/db/posts/route.ts", `import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Post } from "@/lib/models/Post";
import { checkPin, ok, err } from "@/core/auth";
import { triggerHook } from "@/core/plugins/hooks";
import type { PostPayload } from "@/core/plugins/hooks";

export async function GET(req: NextRequest) {
  const denied = await checkPin(req);
  const isAdmin = !denied;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  await connectDB();
  const filter: Record<string, unknown> = {};
  if (!isAdmin) {
    filter.status = "published";
  } else if (status && status !== "all") {
    filter.status = status;
  }

  const rows = await Post.find(filter).sort({ createdAt: -1 }).lean();
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  const rawBody = await req.json();
  const body = await triggerHook("beforeSavePost", rawBody as PostPayload);
  const {
    title, content = "", excerpt = "", status = "draft",
    category = "", author = "Atty. Levi Baligod",
    read_time = "5 min read", tag_css = "bg-slate-100 text-slate-600",
  } = body;
  if (!title) return err("title is required");

  const slug =
    (body.slug as string | undefined) ??
    title.toLowerCase().replace(/[^a-z0-9\\s-]/g, "").replace(/\\s+/g, "-").slice(0, 80) +
    "-" + Date.now().toString(36);

  await connectDB();
  try {
    const doc = await Post.create({ slug, title, content, excerpt, status, category, author, read_time, tag_css });
    await triggerHook("afterSavePost", doc.toObject() as PostPayload);
    return ok(doc.toObject());
  } catch (e) {
    return err(String(e));
  }
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// /api/db/posts/[id]/route.ts
// ─────────────────────────────────────────────────────────────────────────────
write("src/app/api/db/posts/[id]/route.ts", `import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Post } from "@/lib/models/Post";
import { checkPin, ok, err } from "@/core/auth";
import { triggerHook } from "@/core/plugins/hooks";
import type { PostPayload } from "@/core/plugins/hooks";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const denied = await checkPin(req);
  await connectDB();

  const post = await Post.findById(id).lean();
  if (!post) return err("Not found", 404);

  const serialized = post as Record<string, unknown>;
  if (!denied && serialized.status !== "published") {
    const token = req.nextUrl.searchParams.get("preview");
    if (token !== serialized.preview_token) return err("Not found", 404);
  }
  return ok(serialized);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await checkPin(req);
  if (denied) return denied;
  const { id } = await params;

  const rawBody = await req.json();
  const body = await triggerHook("beforeSavePost", rawBody as PostPayload);
  await connectDB();

  try {
    const doc = await Post.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!doc) return err("Not found", 404);
    await triggerHook("afterSavePost", doc as PostPayload);
    return ok(doc);
  } catch (e) {
    return err(String(e));
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await checkPin(req);
  if (denied) return denied;
  const { id } = await params;

  await connectDB();
  const doc = await Post.findByIdAndDelete(id).lean();
  if (!doc) return err("Not found", 404);
  return ok({ deleted: true });
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// /api/db/posts/[id]/preview-token/route.ts
// ─────────────────────────────────────────────────────────────────────────────
write("src/app/api/db/posts/[id]/preview-token/route.ts", `import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Post } from "@/lib/models/Post";
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
`);

// ─────────────────────────────────────────────────────────────────────────────
// /api/db/pages/route.ts
// ─────────────────────────────────────────────────────────────────────────────
write("src/app/api/db/pages/route.ts", `import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Page } from "@/lib/models/Page";
import { checkPin, ok, err } from "@/core/auth";

export async function GET(req: NextRequest) {
  const denied = await checkPin(req);
  const isAdmin = !denied;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  await connectDB();
  const filter: Record<string, unknown> = {};
  if (!isAdmin) {
    filter.status = "published";
  } else if (status && status !== "all") {
    filter.status = status;
  }

  const rows = await Page.find(filter).sort({ updatedAt: -1 }).lean();
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  const body = await req.json() as {
    slug?: string; title: string; content?: string; excerpt?: string; status?: string;
    author?: string; featured_image?: string; meta_title?: string;
    meta_description?: string; og_image?: string;
  };
  if (!body.title) return err("title is required");

  const slug = body.slug || body.title.toLowerCase()
    .replace(/[^a-z0-9\\s-]/g, "").replace(/\\s+/g, "-").slice(0, 80);

  await connectDB();
  try {
    const doc = await Page.create({
      slug, title: body.title, content: body.content ?? "",
      excerpt: body.excerpt ?? "", status: body.status ?? "draft",
      author: body.author ?? "Atty. Levi Baligod",
      featured_image: body.featured_image ?? "",
      meta_title: body.meta_title ?? "",
      meta_description: body.meta_description ?? "",
      og_image: body.og_image ?? "",
    });
    return ok(doc.toObject());
  } catch (e) {
    return err(String(e));
  }
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// /api/db/pages/[id]/route.ts
// ─────────────────────────────────────────────────────────────────────────────
write("src/app/api/db/pages/[id]/route.ts", `import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Page } from "@/lib/models/Page";
import { checkPin, ok, err } from "@/core/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await connectDB();
  const doc = await Page.findById(id).lean();
  if (!doc) {
    const bySlug = await Page.findOne({ slug: id }).lean();
    if (!bySlug) return err("Not found", 404);
    return ok(bySlug);
  }
  return ok(doc);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await checkPin(req);
  if (denied) return denied;
  const { id } = await params;

  const body = await req.json();
  await connectDB();
  try {
    const doc = await Page.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!doc) return err("Not found", 404);
    return ok(doc);
  } catch (e) {
    return err(String(e));
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await checkPin(req);
  if (denied) return denied;
  const { id } = await params;

  await connectDB();
  const doc = await Page.findByIdAndDelete(id).lean();
  if (!doc) return err("Not found", 404);
  return ok({ deleted: true });
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// /api/db/practice-areas/route.ts
// ─────────────────────────────────────────────────────────────────────────────
write("src/app/api/db/practice-areas/route.ts", `import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { PracticeArea } from "@/lib/models/PracticeArea";
import { checkPin, ok, err } from "@/core/auth";

export async function GET() {
  await connectDB();
  const rows = await PracticeArea.find().sort({ sort_order: 1 }).lean();
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  const { icon = "📌", title, description = "", bullets = [], color = "border-amber-500", bg = "bg-amber-50" } = await req.json();
  if (!title) return err("title is required");

  await connectDB();
  const max = await PracticeArea.findOne().sort({ sort_order: -1 }).lean();
  const sort_order = ((max as { sort_order?: number } | null)?.sort_order ?? -1) + 1;

  try {
    const doc = await PracticeArea.create({ icon, title, description, bullets, color, bg, sort_order });
    return ok(doc.toObject());
  } catch (e) {
    return err(String(e));
  }
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// /api/db/practice-areas/[id]/route.ts
// ─────────────────────────────────────────────────────────────────────────────
write("src/app/api/db/practice-areas/[id]/route.ts", `import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { PracticeArea } from "@/lib/models/PracticeArea";
import { checkPin, ok, err } from "@/core/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await connectDB();
  const doc = await PracticeArea.findById(id).lean();
  if (!doc) return err("Not found", 404);
  return ok(doc);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await checkPin(req);
  if (denied) return denied;
  const { id } = await params;

  const body = await req.json();
  await connectDB();
  try {
    const doc = await PracticeArea.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!doc) return err("Not found", 404);
    return ok(doc);
  } catch (e) {
    return err(String(e));
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await checkPin(req);
  if (denied) return denied;
  const { id } = await params;

  await connectDB();
  const doc = await PracticeArea.findByIdAndDelete(id).lean();
  if (!doc) return err("Not found", 404);
  return ok({ deleted: true });
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// /api/db/categories/route.ts
// ─────────────────────────────────────────────────────────────────────────────
write("src/app/api/db/categories/route.ts", `import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Category } from "@/lib/models/Category";
import { checkPin, ok, err } from "@/core/auth";

export async function GET() {
  await connectDB();
  const rows = await Category.find().sort({ name: 1 }).lean();
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  const { name, slug, description = "" } = await req.json();
  if (!name || !slug) return err("name and slug are required");

  await connectDB();
  try {
    const doc = await Category.create({ name, slug, description });
    return ok(doc.toObject());
  } catch (e) {
    return err(String(e));
  }
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// /api/db/categories/[id]/route.ts
// ─────────────────────────────────────────────────────────────────────────────
write("src/app/api/db/categories/[id]/route.ts", `import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Category } from "@/lib/models/Category";
import { checkPin, ok, err } from "@/core/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await checkPin(req);
  if (denied) return denied;
  const { id } = await params;

  const body = await req.json();
  await connectDB();
  try {
    const doc = await Category.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!doc) return err("Not found", 404);
    return ok(doc);
  } catch (e) {
    return err(String(e));
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await checkPin(req);
  if (denied) return denied;
  const { id } = await params;

  await connectDB();
  const doc = await Category.findByIdAndDelete(id).lean();
  if (!doc) return err("Not found", 404);
  return ok({ deleted: true });
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// /api/db/tags/route.ts
// ─────────────────────────────────────────────────────────────────────────────
write("src/app/api/db/tags/route.ts", `import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Tag } from "@/lib/models/Tag";
import { checkPin, ok, err } from "@/core/auth";

export async function GET() {
  await connectDB();
  const rows = await Tag.find().sort({ name: 1 }).lean();
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  const { name, slug } = await req.json();
  if (!name || !slug) return err("name and slug are required");

  await connectDB();
  try {
    const doc = await Tag.create({ name, slug });
    return ok(doc.toObject());
  } catch (e) {
    return err(String(e));
  }
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// /api/db/tags/[id]/route.ts
// ─────────────────────────────────────────────────────────────────────────────
write("src/app/api/db/tags/[id]/route.ts", `import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Tag } from "@/lib/models/Tag";
import { checkPin, ok, err } from "@/core/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await checkPin(req);
  if (denied) return denied;
  const { id } = await params;

  const body = await req.json();
  await connectDB();
  try {
    const doc = await Tag.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!doc) return err("Not found", 404);
    return ok(doc);
  } catch (e) {
    return err(String(e));
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await checkPin(req);
  if (denied) return denied;
  const { id } = await params;

  await connectDB();
  const doc = await Tag.findByIdAndDelete(id).lean();
  if (!doc) return err("Not found", 404);
  return ok({ deleted: true });
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// /api/db/testimonials/route.ts
// ─────────────────────────────────────────────────────────────────────────────
write("src/app/api/db/testimonials/route.ts", `import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Testimonial } from "@/lib/models/Testimonial";
import { checkPin, ok, err } from "@/core/auth";

export async function GET() {
  await connectDB();
  const rows = await Testimonial.find().lean();
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  const { name, case_type = "", rating = 5, text = "", initials = "", color = "bg-slate-600" } = await req.json();
  if (!name) return err("name is required");

  await connectDB();
  try {
    const doc = await Testimonial.create({ name, case_type, rating, text, initials, color });
    return ok(doc.toObject());
  } catch (e) {
    return err(String(e));
  }
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// /api/db/testimonials/[id]/route.ts
// ─────────────────────────────────────────────────────────────────────────────
write("src/app/api/db/testimonials/[id]/route.ts", `import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Testimonial } from "@/lib/models/Testimonial";
import { checkPin, ok, err } from "@/core/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await checkPin(req);
  if (denied) return denied;
  const { id } = await params;

  const body = await req.json();
  await connectDB();
  try {
    const doc = await Testimonial.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!doc) return err("Not found", 404);
    return ok(doc);
  } catch (e) {
    return err(String(e));
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await checkPin(req);
  if (denied) return denied;
  const { id } = await params;

  await connectDB();
  const doc = await Testimonial.findByIdAndDelete(id).lean();
  if (!doc) return err("Not found", 404);
  return ok({ deleted: true });
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// /api/db/faq/route.ts
// ─────────────────────────────────────────────────────────────────────────────
write("src/app/api/db/faq/route.ts", `import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { FAQ } from "@/lib/models/FAQ";
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
`);

// ─────────────────────────────────────────────────────────────────────────────
// /api/db/faq/[id]/route.ts
// ─────────────────────────────────────────────────────────────────────────────
write("src/app/api/db/faq/[id]/route.ts", `import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { FAQ } from "@/lib/models/FAQ";
import { checkPin, ok, err } from "@/core/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await checkPin(req);
  if (denied) return denied;
  const { id } = await params;

  const body = await req.json();
  await connectDB();
  try {
    const doc = await FAQ.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!doc) return err("Not found", 404);
    return ok(doc);
  } catch (e) {
    return err(String(e));
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await checkPin(req);
  if (denied) return denied;
  const { id } = await params;

  await connectDB();
  const doc = await FAQ.findByIdAndDelete(id).lean();
  if (!doc) return err("Not found", 404);
  return ok({ deleted: true });
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// /api/db/experience/route.ts
// ─────────────────────────────────────────────────────────────────────────────
write("src/app/api/db/experience/route.ts", `import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Experience } from "@/lib/models/Experience";
import { checkPin, ok, err } from "@/core/auth";

export async function GET() {
  await connectDB();
  const rows = await Experience.find().sort({ sort_order: 1 }).lean();
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  const { year, title, subtitle = "", description = "", sort_order = 0 } = await req.json();
  if (!year || !title) return err("year and title are required");

  await connectDB();
  try {
    const doc = await Experience.create({ year, title, subtitle, description, sort_order });
    return ok(doc.toObject());
  } catch (e) {
    return err(String(e));
  }
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// /api/db/experience/[id]/route.ts
// ─────────────────────────────────────────────────────────────────────────────
write("src/app/api/db/experience/[id]/route.ts", `import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Experience } from "@/lib/models/Experience";
import { checkPin, ok, err } from "@/core/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await checkPin(req);
  if (denied) return denied;
  const { id } = await params;

  const body = await req.json();
  await connectDB();
  try {
    const doc = await Experience.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!doc) return err("Not found", 404);
    return ok(doc);
  } catch (e) {
    return err(String(e));
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await checkPin(req);
  if (denied) return denied;
  const { id } = await params;

  await connectDB();
  const doc = await Experience.findByIdAndDelete(id).lean();
  if (!doc) return err("Not found", 404);
  return ok({ deleted: true });
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// /api/db/settings/route.ts
// ─────────────────────────────────────────────────────────────────────────────
write("src/app/api/db/settings/route.ts", `import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Setting } from "@/lib/models/Setting";
import { checkPin, ok } from "@/core/auth";

export async function GET(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  await connectDB();
  const rows = await Setting.find().lean() as { key: string; value: string }[];
  const result: Record<string, unknown> = {};
  for (const { key, value } of rows) {
    try { result[key] = JSON.parse(value); } catch { result[key] = value; }
  }
  return ok(result);
}

export async function PUT(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  const body: Record<string, unknown> = await req.json();
  await connectDB();

  const ops = Object.entries(body).map(([k, v]) =>
    Setting.findOneAndUpdate(
      { key: k },
      { key: k, value: typeof v === "string" ? v : JSON.stringify(v) },
      { upsert: true, new: true }
    )
  );
  await Promise.all(ops);
  return ok({ saved: true });
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// /api/users/route.ts
// ─────────────────────────────────────────────────────────────────────────────
write("src/app/api/users/route.ts", `import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { User } from "@/lib/models/User";
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
`);

// ─────────────────────────────────────────────────────────────────────────────
// /api/users/[id]/route.ts
// ─────────────────────────────────────────────────────────────────────────────
write("src/app/api/users/[id]/route.ts", `import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { User } from "@/lib/models/User";
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
`);

// ─────────────────────────────────────────────────────────────────────────────
// /api/media/route.ts
// ─────────────────────────────────────────────────────────────────────────────
write("src/app/api/media/route.ts", `import { NextRequest } from "next/server";
import path from "path";
import fs from "fs";
import connectDB from "@/lib/mongoose";
import { Media } from "@/lib/models/Media";
import { checkPin, ok, err } from "@/core/auth";

export async function GET(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  await connectDB();
  const rows = await Media.find().sort({ createdAt: -1 }).lean();
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return err("Expected multipart/form-data");
  }

  const file = formData.get("file") as File | null;
  if (!file) return err("No file provided");

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
  if (!allowed.includes(file.type)) return err("File type not allowed. Use JPEG, PNG, WebP, GIF or SVG.");

  const maxBytes = 10 * 1024 * 1024;
  if (file.size > maxBytes) return err("File too large (max 10 MB)");

  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const uploadDir = path.join(process.cwd(), "public", "uploads", year, month);
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const ext = path.extname(file.name) || ".bin";
  const base = path.basename(file.name, ext)
    .toLowerCase().replace(/[^a-z0-9_-]/g, "-").slice(0, 60);
  const unique = \`\${base}-\${Date.now().toString(36)}\${ext}\`;
  const filePath = path.join(uploadDir, unique);

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  const url = \`/uploads/\${year}/\${month}/\${unique}\`;
  const alt = formData.get("alt") as string | null;

  await connectDB();
  const doc = await Media.create({
    filename: unique, original_name: file.name,
    mime_type: file.type, size_bytes: file.size, alt: alt ?? "", url,
  });
  return ok(doc.toObject());
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// /api/media/[id]/route.ts
// ─────────────────────────────────────────────────────────────────────────────
write("src/app/api/media/[id]/route.ts", `import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Media } from "@/lib/models/Media";
import { checkPin, ok, err } from "@/core/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await checkPin(req);
  if (denied) return denied;
  const { id } = await params;

  const body = await req.json();
  await connectDB();
  try {
    const doc = await Media.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!doc) return err("Not found", 404);
    return ok(doc);
  } catch (e) {
    return err(String(e));
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await checkPin(req);
  if (denied) return denied;
  const { id } = await params;

  await connectDB();
  const doc = await Media.findByIdAndDelete(id).lean();
  if (!doc) return err("Not found", 404);
  return ok({ deleted: true });
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// /api/admin/pin/route.ts
// ─────────────────────────────────────────────────────────────────────────────
write("src/app/api/admin/pin/route.ts", `import connectDB from "@/lib/mongoose";
import { Setting } from "@/lib/models/Setting";
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
`);

console.log("\\nAll route files written successfully.");
