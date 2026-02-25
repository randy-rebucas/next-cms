import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { writeEnvFile, isSetupComplete } from "@/lib/setup";
import { ENV_SETTING_KEYS } from "@/lib/bootstrap-env";

/**
 * GET /api/setup/status
 *
 * Returns the current installation state:
 *   { complete, hasUri, hasAdmin, autoCompleted? }
 *
 * If MONGODB_URI is set and an admin user already exists, automatically
 * writes SETUP_COMPLETE=true to .env.local (handles upgrades / re-installs).
 */
export async function GET() {
  // Already flagged complete
  if (isSetupComplete()) {
    return NextResponse.json({ complete: true });
  }

  const hasUri = !!process.env.MONGODB_URI;

  if (!hasUri) {
    return NextResponse.json({ complete: false, hasUri: false, hasAdmin: false });
  }

  // URI is set — check for admin users
  try {
    await connectDB();

    // Access (or define) the User model without importing the full Mongoose model
    // to avoid circular dependency issues in the setup context.
    const UserModel =
      mongoose.models.User ??
      mongoose.model(
        "User",
        new mongoose.Schema({ email: String, role: String, status: String })
      );

    const adminCount = await UserModel.countDocuments({ role: "admin" }).exec();

    if (adminCount > 0) {
      // Auto-complete: existing installation — sync env settings to DB and process.env

      // Access (or define) the Setting model in same connection context
      const SettingModel =
        mongoose.models.Setting ??
        mongoose.model(
          "Setting",
          new mongoose.Schema({ key: { type: String, unique: true }, value: String }, { timestamps: true })
        );

      const authSecret =
        process.env.AUTH_SECRET || randomBytes(32).toString("base64");
      const nextAuthUrl =
        process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

      const envSettings = [
        { key: "AUTH_SECRET",    value: authSecret },
        { key: "NEXTAUTH_URL",   value: nextAuthUrl },
        { key: "SETUP_COMPLETE", value: "true" },
      ];

      // Write to DB only if not already there
      for (const { key, value } of envSettings) {
        await SettingModel.updateOne({ key }, { $setOnInsert: { key, value } }, { upsert: true });
      }

      // Hydrate process.env for current request cycle
      for (const key of ENV_SETTING_KEYS) {
        if (!process.env[key]) {
          const match = envSettings.find((s) => s.key === key);
          if (match) process.env[key] = match.value;
        }
      }

      // Write SETUP_COMPLETE to .env.local so middleware catches it on next restart
      try {
        writeEnvFile({ SETUP_COMPLETE: "true" });
      } catch {
        // Filesystem write failed (e.g. read-only in prod) — not fatal
      }
      return NextResponse.json({ complete: true, autoCompleted: true });
    }

    return NextResponse.json({ complete: false, hasUri: true, hasAdmin: false });
  } catch {
    // Can't connect — URI might be wrong
    return NextResponse.json({ complete: false, hasUri: true, hasAdmin: false, uriError: true });
  }
}
