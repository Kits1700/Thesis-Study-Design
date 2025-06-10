import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// For local development, use SQLite if no DATABASE_URL is provided
let pool: Pool;
let db: ReturnType<typeof drizzle>;

if (process.env.DATABASE_URL) {
  // Production/Replit environment with Neon
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  // Local development fallback
  console.warn("DATABASE_URL not found. For local development, please set up a database.");
  console.warn("You can use a local PostgreSQL instance or get a free database from Neon:");
  console.warn("1. Visit https://neon.tech and create a free database");
  console.warn("2. Copy the connection string to your .env file as DATABASE_URL");
  throw new Error("DATABASE_URL must be set for database operations");
}

export { pool, db };