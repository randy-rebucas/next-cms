/**
 * POST /api/admin/themes/upload
 *
 * Accepts a theme manifest (JSON) and saves it as a config preset in MongoDB.
 * Config presets are visual-only themes (colors/fonts) that render on top of
 * the default theme templates — no server rebuild required.
 */
import { NextRequest } from "next/server";
import connectDB from "@/lib/mongoose";
import { Theme } from "@/models/Theme";
import { checkPin, ok, err } from "@/core/auth";

interface ThemeManifest {
  id: string;
  name: string;
  description?: string;
  version?: string;
  author?: string;
  colors?: {
    primaryColor?: string;
    accentColor?: string;
    bgDark?: string;
  };
  typography?: {
    fontFamily?: string;
  };
  borderRadius?: string;
}

// Built-in theme keys that cannot be overwritten via upload
const BUILT_IN_KEYS = ["default"];

export async function POST(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  let manifest: ThemeManifest;
  try {
    manifest = await req.json() as ThemeManifest;
  } catch {
    return err("Invalid JSON body");
  }

  const { id, name } = manifest;
  if (!id || !name) return err("Theme manifest must include 'id' and 'name'");
  if (!/^[a-z0-9-]+$/.test(id)) {
    return err("Theme id must be lowercase letters, numbers, and hyphens only");
  }
  if (BUILT_IN_KEYS.includes(id)) return err(`Cannot overwrite built-in theme '${id}'`);

  await connectDB();

  const existing = await Theme.findOne({ key: id }).lean();
  if (existing) return err(`A theme with id '${id}' is already installed`);

  // Merge visual config into a flat colors object
  const colors: Record<string, string> = {};
  if (manifest.colors?.primaryColor) colors.primaryColor = manifest.colors.primaryColor;
  if (manifest.colors?.accentColor)  colors.accentColor  = manifest.colors.accentColor;
  if (manifest.colors?.bgDark)       colors.bgDark       = manifest.colors.bgDark;
  if (manifest.typography?.fontFamily) colors.fontFamily = manifest.typography.fontFamily;
  if (manifest.borderRadius)         colors.borderRadius = manifest.borderRadius;

  const doc = await Theme.create({
    key: id,
    name,
    description: manifest.description || "",
    version:     manifest.version     || "1.0.0",
    author:      manifest.author      || "",
    isActive:    false,
    colors,
  });

  return ok({
    key:     doc.key,
    name:    doc.name,
    version: doc.version,
    author:  doc.author,
    colors,
  });
}
