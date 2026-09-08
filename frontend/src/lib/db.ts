import { neon } from "@neondatabase/serverless";

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL ?? process.env.DATABASE_URL_UNPOOLED;
  if (!url) {
    throw new Error("DATABASE_URL or DATABASE_URL_UNPOOLED environment variable is not set");
  }
  return url;
}

export function getDb() {
  const connectionString = getDatabaseUrl();
  return neon(connectionString);
}
