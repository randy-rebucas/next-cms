/**
 * core/theme/theme-logger.ts
 *
 * Structured error / warning logging for the theme engine.
 *
 * In development: writes to console with a [theme-engine] prefix.
 * In production: extend `logThemeError` to send to your monitoring
 * service (Sentry, Datadog, etc.) by replacing the console.error call.
 *
 * Production Hardening Checklist item: "Logging system for theme errors"
 */

export interface ThemeLogContext {
  /** Active theme name at the time of the error */
  theme?: string;
  /** Template slot being loaded (e.g. "post", "layout") */
  template?: string;
  /** Logical operation that failed (e.g. "loadLayout", "getActiveTheme") */
  operation?: string;
}

function buildPrefix(context: ThemeLogContext): string {
  const parts = ["[theme-engine]"];
  if (context.theme)     parts.push(`theme=${context.theme}`);
  if (context.operation) parts.push(`op=${context.operation}`);
  if (context.template)  parts.push(`template=${context.template}`);
  return parts.join(" | ");
}

/**
 * Log a theme-system error with structured context.
 * Swap the console.error for a monitoring SDK call in production.
 */
export function logThemeError(error: unknown, context: ThemeLogContext = {}): void {
  const msg = error instanceof Error ? error.message : String(error);
  console.error(`${buildPrefix(context)} | ${msg}`);
}

/**
 * Log a non-fatal theme warning (e.g. unknown theme name, missing asset).
 */
export function logThemeWarn(message: string, context: ThemeLogContext = {}): void {
  console.warn(`${buildPrefix(context)} | ${message}`);
}
