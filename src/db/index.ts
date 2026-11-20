import fs from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const rawUrl = (
  process.env.DATABASE_URL ||
  process.env.DB_CMS_TURSO_DATABASE_URL ||
  process.env.TURSO_DATABASE_URL ||
  ""
).trim();

const connectionUrl =
  rawUrl || (process.env.VERCEL ? "file:/tmp/cms.db" : "file:./data/cms.db");

const authToken =
  (
    process.env.DATABASE_AUTH_TOKEN ||
    process.env.DB_CMS_TURSO_AUTH_TOKEN ||
    process.env.TURSO_AUTH_TOKEN ||
    ""
  ).trim() || undefined;

function ensureLocalSqliteDir(url: string) {
  if (!url.startsWith("file:")) return;
  const filePath = url.replace(/^file:/, "").split("?")[0];
  if (filePath.startsWith("/tmp")) return;
  try {
    const dir = path.isAbsolute(filePath)
      ? path.dirname(filePath)
      : path.join(/*turbopackIgnore: true*/ process.cwd(), path.dirname(filePath));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch {
    // Ignore on read-only serverless filesystems (e.g., Vercel /var/task)
  }
}

const globalForDb = globalThis as unknown as {
  libsqlClient: Client | undefined;
};

function createLibsqlClient(): Client {
  ensureLocalSqliteDir(connectionUrl);
  return createClient({
    url: connectionUrl,
    authToken,
  });
}

const client = globalForDb.libsqlClient ?? createLibsqlClient();

if (process.env.NODE_ENV !== "production") {
  globalForDb.libsqlClient = client;
}

export const db = drizzle(client, { schema });
export const isDatabaseConfigured = true;
export const databaseUrlLabel = connectionUrl.startsWith("file:")
  ? `SQLite (${connectionUrl.replace(/^file:\.?\//, "")})`
  : "Turso libSQL";
