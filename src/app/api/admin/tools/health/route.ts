/**
 * GET /api/admin/tools/health
 * Returns system health: DB status, env config, runtime info, content counts.
 */
import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Post } from "@/models/Post";
import { Page } from "@/models/Page";
import { checkPin, ok, err } from "@/core/auth";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  // DB health
  let dbStatus: "connected" | "disconnected" | "error" = "disconnected";
  let postCount = 0;
  let pageCount = 0;
  try {
    await connectDB();
    dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    [postCount, pageCount] = await Promise.all([
      Post.countDocuments(),
      Page.countDocuments(),
    ]);
  } catch {
    dbStatus = "error";
  }

  // Package versions
  let nextVersion = "unknown";
  let appVersion = "unknown";
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8")
    );
    nextVersion = pkg.dependencies?.next ?? pkg.devDependencies?.next ?? "unknown";
    appVersion = pkg.version ?? "unknown";
  } catch { /* */ }

  // Environment config checks (values hidden, only presence shown)
  const envChecks = [
    { key: "MONGODB_URI",       set: !!process.env.MONGODB_URI },
    { key: "NEXTAUTH_SECRET",   set: !!process.env.NEXTAUTH_SECRET },
    { key: "NEXTAUTH_URL",      set: !!process.env.NEXTAUTH_URL },
    { key: "SMTP_HOST",         set: !!process.env.SMTP_HOST },
    { key: "ADMIN_PIN",         set: !!process.env.ADMIN_PIN },
  ];

  return ok({
    db: {
      status: dbStatus,
      posts: postCount,
      pages: pageCount,
    },
    runtime: {
      nodeVersion: process.version,
      platform: process.platform,
      nextVersion,
      appVersion,
      uptime: Math.floor(process.uptime()),
    },
    env: envChecks,
    timestamp: new Date().toISOString(),
  });
}
