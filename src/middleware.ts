import NextAuth from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

/**
 * Edge-safe auth helper — uses only the JWT callback config, no DB/bcrypt.
 * The full credentials provider lives in src/auth.ts (Node.js runtime only).
 */
const { auth } = NextAuth(authConfig);

/**
 * Global middleware.
 *
 * - Public routes: pass through
 * - /admin/login: pass through (the login page itself)
 * - /admin/*: require a valid NextAuth session → redirect to /admin/login
 * - /api/users/*: require a valid NextAuth session → 401 JSON
 */
export async function middleware(req: NextRequest) {
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

  // Protect admin UI routes
  if (pathname.startsWith("/admin")) {
    const session = await auth();
    if (!session) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect users API endpoint — require session
  if (pathname.startsWith("/api/users")) {
    const session = await auth();
    if (!session) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
