import process from "node:process";
import { runBatchProcessor } from "./service/watcher-procesing-service.js";
import { startAPI } from "./api/api.js";
import { logger } from "./logger.js";
import { DBClient } from "./database/database.js";

const isDryRun = process.env.MAIL_DRY_RUN === "true";

async function main() {
  logger.info("starting vinted watcher bot");
  const dbUrl = process.env.DB_URL;
  if (!dbUrl) {
    logger.error("no database url provided: env.DB_URL is undefined");
    process.exit(1);
  }

  const db = await DBClient.init(dbUrl);

  try {
    logger.info("starting batch processor", "dry run", isDryRun);
    runBatchProcessor(db, isDryRun);
  } catch (err) {
    logger.error("starting batch processor", err);
    process.exit(1);
  }

  try {
    logger.info("starting REST server");
    await startAPI(db);
  } catch (err) {
    logger.error("failed to start REST server", err);
    process.exit(1);
  }
}

main();
