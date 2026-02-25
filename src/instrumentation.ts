/**
 * src/instrumentation.ts
 *
 * Next.js instrumentation hook — runs once when the server starts.
 * Bootstraps process.env from the DB so env vars don't need to live
 * in .env.local (except MONGODB_URI, which is needed to connect).
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Only run in the Node.js runtime (not the Edge runtime)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { bootstrapEnvFromDB } = await import("./lib/bootstrap-env");
    await bootstrapEnvFromDB();
  }
}
