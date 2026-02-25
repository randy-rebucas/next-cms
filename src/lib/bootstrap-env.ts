/**
 * src/lib/bootstrap-env.ts
 *
 * Reads env-level config keys stored in the DB Settings collection and
 * populates process.env for any that are missing from the real environment.
 *
 * Called once at server startup via src/instrumentation.ts.
 * MONGODB_URI must already be present in the environment — it cannot be
 * bootstrapped from the DB (chicken-and-egg).
 */

/** Settings keys that map directly to process.env variables. */
export const ENV_SETTING_KEYS = [
  "AUTH_SECRET",
  "NEXTAUTH_URL",
  "SETUP_COMPLETE",
] as const;

export type EnvSettingKey = (typeof ENV_SETTING_KEYS)[number];

export async function bootstrapEnvFromDB(): Promise<void> {
  if (!process.env.MONGODB_URI) {
    // Cannot connect — skip silently (fresh install before setup)
    return;
  }

  try {
    const { default: connectDB } = await import("./mongoose");
    const { Setting } = await import("@/models/Setting");

    await connectDB();

    const rows = await Setting.find({
      key: { $in: [...ENV_SETTING_KEYS] },
    }).lean() as { key: string; value: string }[];

    for (const { key, value } of rows) {
      // Only fill in; never overwrite a real env var that's already set
      if (!process.env[key] && value) {
        process.env[key] = value;
      }
    }
  } catch {
    // DB unavailable or schema not yet created — proceed with what's in env
  }
}
