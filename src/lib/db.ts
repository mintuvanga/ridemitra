import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString && process.env.NODE_ENV === "production") {
  console.warn("DATABASE_URL is not configured; database-backed routes will return a configuration error.");
}

const globalForPostgres = globalThis as unknown as { rideMitraSql?: ReturnType<typeof postgres> };

export const sql = globalForPostgres.rideMitraSql ?? (connectionString
  ? postgres(connectionString, {
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: process.env.NODE_ENV === "production" ? "require" : false,
    })
  : null);

if (process.env.NODE_ENV !== "production" && sql) {
  globalForPostgres.rideMitraSql = sql;
}

export function getSql() {
  if (!sql) throw new Error("Database is not configured. Add DATABASE_URL to the RideMitra service environment.");
  return sql;
}
