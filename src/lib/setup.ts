/**
 * src/lib/setup.ts
 *
 * Server-side utilities for the setup/install wizard.
 * Handles reading/writing .env.local and checking setup state.
 */
import fs from "fs";
import path from "path";

const ENV_PATH = path.join(process.cwd(), ".env.local");

/** Parse .env.local into a key→value map. */
export function readEnvFile(): Record<string, string> {
  try {
    const content = fs.readFileSync(ENV_PATH, "utf8");
    const result: Record<string, string> = {};
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      result[key] = value;
    }
    return result;
  } catch {
    return {};
  }
}

/** Write / merge key-value pairs into .env.local, preserving comments and blank lines. */
export function writeEnvFile(updates: Record<string, string>): void {
  const remaining = new Set(Object.keys(updates));

  // Read existing file as raw lines so comments and blank lines are preserved
  let rawLines: string[] = [];
  try {
    rawLines = fs.readFileSync(ENV_PATH, "utf8").split("\n");
  } catch {
    // File doesn't exist yet — start fresh
  }

  // Update matching key lines in-place
  const updatedLines = rawLines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return line; // preserve comment/blank
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) return line;
    const key = trimmed.slice(0, eqIdx).trim();
    if (key in updates) {
      remaining.delete(key);
      return `${key}=${updates[key]}`;
    }
    return line;
  });

  // Append any new keys that didn't exist yet
  for (const key of remaining) {
    updatedLines.push(`${key}=${updates[key]}`);
  }

  fs.writeFileSync(ENV_PATH, updatedLines.join("\n"), "utf8");
}

/** Quick check — reads process.env (no FS) to avoid slowing down middleware. */
export function isSetupComplete(): boolean {
  return process.env.SETUP_COMPLETE === "true";
}
