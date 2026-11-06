import app from "./app";
import { config } from "./config/config";
import { checkDb, pool } from "./config/db";
import { logger } from "./utils/logger";

async function main() {
  await checkDb();
  const server = app.listen(config.port, () =>
    logger.info(`Server running on port ${config.port}`)
  );

  const shutdown = () => {
    logger.info("Shutting down...");
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  logger.fatal({ err }, "Failed to start server");
  process.exit(1);
});