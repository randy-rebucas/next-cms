/**
 * src/auth.config.ts
 *
 * Edge-compatible NextAuth configuration.
 * Contains ONLY callbacks, pages, and session config — NO imports that
 * touch Node.js built-ins (bcryptjs, mongoose, crypto, etc.).
 *
 * Used by:
 *   • src/middleware.ts  (runs on Edge Runtime)
 *
 * The full config (including the Credentials provider with DB access) lives
 * in src/auth.ts and is used everywhere else (API routes, Server Components).
 */
import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/core/rbac";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },

  session: { strategy: "jwt" },

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token["id"] = user.id;
        token["role"] = (user as { role?: Role }).role;
        token["permissions"] = (user as { permissions?: string[] }).permissions;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token["id"] as string;
        (session.user as { role?: Role }).role = token["role"] as Role;
        (session.user as { permissions?: string[] }).permissions =
          (token["permissions"] as string[]) ?? [];
      }
      return session;
    },
  },

  // No providers here — the Credentials provider needs bcrypt & mongoose,
  // both of which are incompatible with the Edge Runtime.
  providers: [],
};
