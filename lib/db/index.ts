import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

function createDb(connectionString: string) {
  const pool = new Pool({ connectionString });
  return drizzle(pool, { schema });
}

export const db = createDb(process.env.DATABASE_URL!);

export function createTestDb() {
  return createDb(process.env.TEST_DATABASE_URL!);
}
