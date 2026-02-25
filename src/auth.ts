/**
 * src/auth.ts
 *
 * NextAuth.js v5 (Auth.js) configuration.
 * Credentials provider — validates email + password against the MongoDB users collection.
 * Extends the edge-safe base config from auth.config.ts.
 */
import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongoose";
import { User } from "@/models/User";
import type { Role } from "@/core/rbac";
import { authConfig } from "@/auth.config";

// ── Augment NextAuth session types ───────────────────────────────────────────

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      permissions: string[];
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: Role;
    permissions: string[];
  }
}

// ── Auth config ───────────────────────────────────────────────────────────────

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        await connectDB();
        const user = await User.findOne({ email }).lean() as {
          _id: { toString(): string };
          name: string;
          email: string;
          password_hash: string;
          role: Role;
          permissions: string[];
        } | null;

        if (!user) return null;

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.permissions ?? [],
        };
      },
    }),
  ],
});
