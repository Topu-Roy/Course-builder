import { cache } from "react";
import { env } from "@/env";
import { db } from "@/server/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins/admin";
import { headers } from "next/headers";

export const auth = betterAuth({
  appName: "My app",
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },

  // Session cookie for client-side caching
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60, // 1 minute
    },
  },

  // Plugins
  plugins: [nextCookies(), admin()],
});

/**
 * Get the server-side authentication session.
 *
 * @returns The server-side authentication session.
 */
export const getServerSession = cache(async () => auth.api.getSession({ headers: await headers() }));
