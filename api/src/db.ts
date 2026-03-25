import { Pool } from "pg";
import { config } from "./config";

let pool: Pool | undefined;

export function getDbPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: config.databaseUrl,
      max: 10
    });
  }

  return pool;
}
