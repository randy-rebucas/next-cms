/**
 * GET /api/admin/tools/export?type=posts|pages|all
 * Exports content as a JSON download.
 */
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { Post } from "@/models/Post";
import { Page } from "@/models/Page";
import { checkPin } from "@/core/auth";

export async function GET(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  const type = new URL(req.url).searchParams.get("type") ?? "all";

  await connectDB();

  const [posts, pages] = await Promise.all([
    type === "pages" ? [] : Post.find().lean(),
    type === "posts" ? [] : Page.find().lean(),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    version: "1",
    posts: type === "pages" ? [] : posts,
    pages: type === "posts" ? [] : pages,
  };

  const filename = `export-${type}-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
