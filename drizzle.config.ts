import { defineConfig } from "drizzle-kit";

const dbUrl =
  (
    process.env.DATABASE_URL ||
    process.env.DB_CMS_TURSO_DATABASE_URL ||
    process.env.TURSO_DATABASE_URL ||
    ""
  ).trim() || "file:./data/cms.db";

const authToken =
  (
    process.env.DATABASE_AUTH_TOKEN ||
    process.env.DB_CMS_TURSO_AUTH_TOKEN ||
    process.env.TURSO_AUTH_TOKEN ||
    ""
  ).trim() || undefined;

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: dbUrl.startsWith("file:") ? "sqlite" : "turso",
  dbCredentials: authToken ? { url: dbUrl, authToken } : { url: dbUrl },
});
