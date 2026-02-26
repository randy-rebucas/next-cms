import NextAuth from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

/**
 * Edge-safe auth helper — uses only the JWT callback config, no DB/bcrypt.
 * The full credentials provider lives in src/auth.ts (Node.js runtime only).
 */
const { auth } = NextAuth(authConfig);

/**
 * Global proxy (Next.js 16 successor to middleware).
 *
 * - Public routes: pass through
 * - /admin/login: pass through (the login page itself)
 * - /admin/*: require a valid NextAuth session → redirect to /admin/login
 * - /api/users/*: require a valid NextAuth session → 401 JSON
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow Next.js internals, static files, and auth API
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/admin/login" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // ── Setup gate ──────────────────────────────────────────────────────────
  // Setup API routes are always accessible (the wizard calls them)
  if (pathname.startsWith("/api/setup")) {
    return NextResponse.next();
  }

  const isSetupDone = process.env.SETUP_COMPLETE === "true";

  if (!isSetupDone) {
    // Allow access to the setup wizard itself; redirect everything else
    if (pathname.startsWith("/setup")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/setup", req.url));
  }

  // If setup is complete and someone navigates to /setup, send them home
  if (pathname.startsWith("/setup")) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  // ── End setup gate ───────────────────────────────────────────────────────

  // Protect admin UI routes and admin-facing API endpoints with a single session check
  const needsAuth =
    pathname.startsWith("/admin") || pathname.startsWith("/api/users");

  if (needsAuth) {
    const session = await auth();

    if (pathname.startsWith("/admin")) {
      if (!session) {
        const loginUrl = new URL("/admin/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    if (pathname.startsWith("/api/users")) {
      if (!session) {
        return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
