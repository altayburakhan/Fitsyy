import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

async function main() {
  const connectionString = process.env.DATABASE_URL!;
  const client = postgres(connectionString, { max: 1, ssl: "require" }); // ← önemli
  const db = drizzle(client);
  await migrate(db, { migrationsFolder: "drizzle" });
  await client.end();
  console.log("Migrations applied ✅");
}

main().catch((e) => { console.error(e); process.exit(1); });
