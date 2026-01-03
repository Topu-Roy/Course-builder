import { createEnv } from "@t3-oss/env-nextjs";
import { enum as enum_, string, url } from "zod/v4";

export const env = createEnv({
  server: {
    NODE_ENV: enum_(["development", "test", "production"]).default("development"),
    // Database
    DATABASE_URL: url().nonempty(),

    // Auth
    BETTER_AUTH_SECRET: string().nonempty(),
    BETTER_AUTH_URL: url().nonempty(),

    GITHUB_CLIENT_ID: string().nonempty(),
    GITHUB_CLIENT_SECRET: string().nonempty(),

    // Storage
    UPLOADTHING_TOKEN: string().nonempty(),

    // AI
    GOOGLE_GENERATIVE_AI_API_KEY: string().nonempty(),

    // YouTube
    YOUTUBE_DATA_V3_API_KEY: string().nonempty(),
  },

  client: {},

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    YOUTUBE_DATA_V3_API_KEY: process.env.YOUTUBE_DATA_V3_API_KEY,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
