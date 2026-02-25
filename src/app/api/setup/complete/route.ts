import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import mongoose, { Connection } from "mongoose";
import { connectWithUri } from "@/lib/mongoose";
import { writeEnvFile } from "@/lib/setup";
import { ENV_SETTING_KEYS } from "@/lib/bootstrap-env";

interface SetupPayload {
  uri: string;
  siteName: string;
  siteTagline: string;
  siteUrl: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

/**
 * POST /api/setup/complete
 *
 * Finalises the installation:
 *   1. Connects to MongoDB using the provided URI.
 *   2. Creates the first admin user (bcrypt password).
 *   3. Writes site + env settings to the DB Settings collection.
 *   4. Writes only MONGODB_URI to .env.local (all other config lives in DB).
 *      AUTH_SECRET is auto-generated if not already in process.env.
 *
 * Returns { ok: true } on success or { ok: false, error } on failure.
 */
export async function POST(req: NextRequest) {
  let conn: Connection | null = null;

  try {
    const body = await req.json() as Partial<SetupPayload>;

    // ── Validate required fields ────────────────────────────────────────────
    const required: (keyof SetupPayload)[] = [
      "siteName", "adminName", "adminEmail", "adminPassword",
    ];
    for (const field of required) {
      if (!body[field]?.trim()) {
        return NextResponse.json({ ok: false, error: `${field} is required.` }, { status: 400 });
      }
    }

    // uri is optional — fall back to the existing env var for already-configured installs
    const resolvedUri = body.uri?.trim() || process.env.MONGODB_URI || "";
    if (!resolvedUri) {
      return NextResponse.json({ ok: false, error: "MongoDB URI is required." }, { status: 400 });
    }

    const {
      siteName,
      siteTagline = "",
      siteUrl = "",
      adminName,
      adminEmail,
      adminPassword,
    } = body as SetupPayload;
    const uri = resolvedUri;

    if (adminPassword.length < 8) {
      return NextResponse.json(
        { ok: false, error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    // ── Connect ─────────────────────────────────────────────────────────────
    conn = await connectWithUri(uri);

    // ── Ensure models exist in this connection context ───────────────────────
    const UserModel =
      conn.models.User ??
      conn.model(
        "User",
        new mongoose.Schema(
          {
            name: String,
            email: { type: String, unique: true },
            password_hash: String,
            role: { type: String, default: "admin" },
            permissions: { type: [String], default: [] },
            status: { type: String, default: "active" },
          },
          { timestamps: true }
        )
      );

    const SettingModel =
      conn.models.Setting ??
      conn.model(
        "Setting",
        new mongoose.Schema(
          {
            key: { type: String, unique: true },
            value: String,
          },
          { timestamps: true }
        )
      );

    // ── Create admin user ────────────────────────────────────────────────────
    const existing = await UserModel.findOne({ email: adminEmail }).lean();
    if (!existing) {
      const hash = await bcrypt.hash(adminPassword, 12);
      await UserModel.create({
        name: adminName,
        email: adminEmail,
        password_hash: hash,
        role: "admin",
        permissions: [],
        status: "active",
      });
    }

    // ── Save site + env settings to DB ───────────────────────────────────────
    // Resolve or generate AUTH_SECRET
    const authSecret =
      process.env.AUTH_SECRET ||
      randomBytes(32).toString("base64");

    // Resolve NEXTAUTH_URL from siteUrl or request origin
    const nextAuthUrl =
      process.env.NEXTAUTH_URL ||
      siteUrl ||
      new URL(req.url).origin;

    const allSettings = [
      // Site settings
      { key: "siteName",    value: siteName },
      { key: "siteTagline", value: siteTagline },
      { key: "siteUrl",     value: siteUrl },
      // Env-level config stored in DB
      { key: "AUTH_SECRET",    value: authSecret },
      { key: "NEXTAUTH_URL",   value: nextAuthUrl },
      { key: "SETUP_COMPLETE", value: "true" },
    ];
    for (const { key, value } of allSettings) {
      await SettingModel.updateOne({ key }, { $set: { value } }, { upsert: true });
    }

    // Hydrate process.env immediately so the running server doesn’t need a restart
    // for the current request cycle (instrumentation handles future restarts)
    for (const key of ENV_SETTING_KEYS) {
      if (!process.env[key]) {
        const row = allSettings.find((s) => s.key === key);
        if (row) process.env[key] = row.value;
      }
    }

    // ── Write only MONGODB_URI to .env.local ───────────────────────────────
    // Everything else (AUTH_SECRET, NEXTAUTH_URL, SETUP_COMPLETE) is
    // loaded from the DB at startup via src/instrumentation.ts.
    writeEnvFile({ MONGODB_URI: uri });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Setup failed.";
    const safe = msg.replace(/(mongodb(?:\+srv)?:\/\/)[^@]*@/gi, "$1***@");
    return NextResponse.json({ ok: false, error: safe });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch {
        // ignore disconnect errors
      }
    }
  }
}
