import process from "node:process";
import { runBatchProcessor } from "./service/watcher-procesing-service.js";
import { logger } from "./logger.js";
import { DBClient } from "./database/database.js";
import { Api } from "./api/express-api.js";

async function main() {
  logger.info("starting vinted watcher bot");
  const dbUrl = process.env.DB_URL;
  if (!dbUrl) {
    logger.error("no database url provided: env.DB_URL is undefined");
    process.exit(1);
  }

  const db = new DBClient(dbUrl);

  try {
    logger.info("starting batch processor");
    runBatchProcessor(db);
  } catch (err) {
    logger.error("starting batch processor", err);
    process.exit(1);
  }

  try {
    Api.boot(db);
    logger.info("starting API");
  } catch (err) {
    logger.error("failed to start API", err);
    process.exit(1);
  }
}

main();
