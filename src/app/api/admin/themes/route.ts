/**
 * GET  /api/admin/themes   — list all installed themes
 * POST /api/admin/themes   — activate a theme by key
 */
import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import connectDB from "@/lib/mongoose";
import { Setting } from "@/models/Setting";
import { Theme } from "@/models/Theme";
import { checkPin, ok, err } from "@/core/auth";

export interface ThemeInfo {
  key: string;
  name: string;
  description: string;
  version: string;
  author: string;
  screenshot: string | null;
  isActive: boolean;
  isBuiltIn: boolean;
  colors?: Record<string, string>;
}

function readBuiltInThemes(): Omit<ThemeInfo, "isActive">[] {
  const themesDir = path.join(process.cwd(), "src", "themes");
  const result: Omit<ThemeInfo, "isActive">[] = [];

  let dirs: string[] = [];
  try {
    dirs = fs
      .readdirSync(themesDir)
      .filter((f) => fs.statSync(path.join(themesDir, f)).isDirectory());
  } catch {
    return result;
  }

  for (const key of dirs) {
    let meta: Record<string, unknown> = {};
    try {
      const configPath = path.join(themesDir, key, "config.json");
      meta = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    } catch {
      meta = { name: key };
    }

    // Only built-in if it has a layout.tsx (i.e., real React templates)
    const isBuiltIn = fs.existsSync(path.join(themesDir, key, "layout.tsx"));

    const screenshotAbs = path.join(process.cwd(), "public", "themes", key, "screenshot.png");
    const screenshot = fs.existsSync(screenshotAbs) ? `/themes/${key}/screenshot.png` : null;

    result.push({
      key,
      name: String(meta.name || key),
      description: String(meta.description || ""),
      version: String(meta.version || "1.0.0"),
      author: String(meta.author || ""),
      screenshot,
      isBuiltIn,
    });
  }

  return result;
}

export async function GET(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  await connectDB();

  // Built-in themes (filesystem)
  const builtIn = readBuiltInThemes();
  const builtInKeys = new Set(builtIn.map((t) => t.key));

  // DB themes (uploaded config presets) — exclude built-in keys
  const dbThemes = (await Theme.find().lean()) as Array<{
    key: string;
    name: string;
    description?: string;
    version?: string;
    author?: string;
    colors?: Map<string, string>;
  }>;

  const dbOnly = dbThemes
    .filter((t) => !builtInKeys.has(t.key))
    .map((t) => ({
      key: t.key,
      name: t.name || t.key,
      description: t.description || "",
      version: t.version || "1.0.0",
      author: t.author || "",
      screenshot: null as string | null,
      isBuiltIn: false,
      colors: t.colors instanceof Map
        ? Object.fromEntries(t.colors)
        : (t.colors as unknown as Record<string, string> | undefined),
    }));

  // Active theme state
  const [activeRow, presetRow] = await Promise.all([
    Setting.findOne({ key: "activeTheme" }).lean() as Promise<{ value?: string } | null>,
    Setting.findOne({ key: "activePreset" }).lean() as Promise<{ value?: string } | null>,
  ]);
  const activeKey = activeRow?.value?.trim() || "default";
  const activePreset = presetRow?.value?.trim() || "";

  const all: ThemeInfo[] = [
    ...builtIn.map((t) => ({
      ...t,
      isActive: t.key === activeKey && !activePreset,
    })),
    ...dbOnly.map((t) => ({
      ...t,
      isActive: t.key === activePreset,
    })),
  ];

  return ok(all);
}

export async function POST(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  const body = await req.json() as { themeKey?: string };
  if (!body.themeKey) return err("themeKey required");
  const themeKey = body.themeKey;

  await connectDB();

  // Determine if this is a built-in code theme (has layout.tsx)
  const layoutPath = path.join(process.cwd(), "src", "themes", themeKey, "layout.tsx");
  const isBuiltIn = fs.existsSync(layoutPath);

  if (isBuiltIn) {
    // Activate code theme → update activeTheme, clear activePreset
    await Promise.all([
      Setting.findOneAndUpdate(
        { key: "activeTheme" },
        { key: "activeTheme", value: themeKey },
        { upsert: true, new: true }
      ),
      Setting.findOneAndUpdate(
        { key: "activePreset" },
        { key: "activePreset", value: "" },
        { upsert: true, new: true }
      ),
    ]);
  } else {
    // Config preset → keep templates as "default", apply colors to siteTheme
    const dbTheme = await Theme.findOne({ key: themeKey }).lean() as {
      colors?: Map<string, string> | Record<string, string>;
    } | null;

    if (!dbTheme) return err("Theme not found", 404);

    const colors: Record<string, string> =
      dbTheme.colors instanceof Map
        ? Object.fromEntries(dbTheme.colors)
        : (dbTheme.colors as Record<string, string> | undefined) ?? {};

    // Apply colors to siteTheme
    const currentRow = await Setting.findOne({ key: "siteTheme" }).lean() as { value?: string } | null;
    let current: Record<string, unknown> = {};
    try { current = JSON.parse(currentRow?.value ?? "{}"); } catch { /* */ }

    await Promise.all([
      Setting.findOneAndUpdate(
        { key: "activeTheme" },
        { key: "activeTheme", value: "default" },
        { upsert: true, new: true }
      ),
      Setting.findOneAndUpdate(
        { key: "activePreset" },
        { key: "activePreset", value: themeKey },
        { upsert: true, new: true }
      ),
      Setting.findOneAndUpdate(
        { key: "siteTheme" },
        { key: "siteTheme", value: JSON.stringify({ ...current, ...colors }) },
        { upsert: true, new: true }
      ),
    ]);
  }

  return ok({ activated: themeKey });
}
