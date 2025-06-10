import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from "@shared/schema";

let pool: Pool;
let db: ReturnType<typeof drizzle>;

// Check for DATABASE_URL environment variable
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL environment variable is not set.");
  console.error("📝 Create a .env file in the project root with:");
  console.error("   DATABASE_URL=postgresql://username:password@host:port/database");
  console.error("🌐 Get a free database at: https://neon.tech");
  process.exit(1);
}

try {
  // Create connection pool
  pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false }
  });

  // Initialize Drizzle ORM
  db = drizzle(pool, { schema });
  
  console.log("✅ Database connection established");
} catch (error) {
  console.error("❌ Failed to connect to database:", error);
  process.exit(1);
}

export { pool, db };