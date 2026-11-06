import { Pool } from "pg";
import { config } from "./config";
import { logger } from "../utils/logger";

export const pool = new Pool({ connectionString: config.databaseUrl });

pool.on("error", (err) => logger.error({ err }, "Unexpected Postgres pool error"));

export async function checkDb(): Promise<void> {
  await pool.query("SELECT 1");
  logger.info("Connected to Postgres");
}