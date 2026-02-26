/**
 * src/lib/rate-limit.ts
 *
 * In-memory sliding-window rate limiter using rate-limiter-flexible.
 * Suitable for single-instance deployments. For multi-instance, swap
 * RateLimiterMemory for RateLimiterRedis.
 */
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";
import { NextRequest, NextResponse } from "next/server";

// ── Limiter instances ─────────────────────────────────────────────────────────

/** Strict limiter for auth endpoints: 5 attempts per 15 minutes */
const authLimiter = new RateLimiterMemory({
  keyPrefix: "auth",
  points: 5,
  duration: 15 * 60, // 15 minutes in seconds
});

/** General API limiter: 120 requests per minute */
const apiLimiter = new RateLimiterMemory({
  keyPrefix: "api",
  points: 120,
  duration: 60,
});

/** Comment submission limiter: 5 per 10 minutes per IP */
const commentLimiter = new RateLimiterMemory({
  keyPrefix: "comment",
  points: 5,
  duration: 10 * 60,
});

// ── Helper ────────────────────────────────────────────────────────────────────

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

type LimiterType = "auth" | "api" | "comment";

const LIMITERS: Record<LimiterType, RateLimiterMemory> = {
  auth: authLimiter,
  api: apiLimiter,
  comment: commentLimiter,
};

/**
 * Check rate limit for a request.
 * Returns a 429 NextResponse if the limit is exceeded, or null if OK.
 *
 * @example
 * const limited = await rateLimit(req, "auth");
 * if (limited) return limited;
 */
export async function rateLimit(
  req: NextRequest,
  type: LimiterType = "api"
): Promise<NextResponse | null> {
  const ip = getIp(req);
  const limiter = LIMITERS[type];

  try {
    await limiter.consume(ip);
    return null;
  } catch (e) {
    if (e instanceof RateLimiterRes) {
      const retryAfter = Math.ceil(e.msBeforeNext / 1000);
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Reset": String(Date.now() + e.msBeforeNext),
          },
        }
      );
    }
    // Unexpected error — fail open (don't block the request)
    return null;
  }
}
