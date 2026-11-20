import fs from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const rawUrl = process.env.DATABASE_URL?.trim();
const connectionUrl = rawUrl || "file:./data/cms.db";
const authToken = process.env.DATABASE_AUTH_TOKEN?.trim() || undefined;

function ensureLocalSqliteDir(url: string) {
  if (!url.startsWith("file:")) return;
  const dataDir = path.join(/*turbopackIgnore: true*/ process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
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
