import { Watcher } from "../types.js";
import { searchVinted } from "./vinted-api-client.js";
import { DBClient } from "../database/database.js";
import { mailService } from "./mail-service.js";
import { logger } from "../logger.js";

const SECOND = 1000;


export function runBatchProcessor(db: DBClient, dryRun: boolean): void {
  const batchSize = Number(process.env.BATCH_SIZE ?? 10);
  const frequency = Number(process.env.BATCH_FREQUENCY) || 5 * SECOND;

  let isProcessing = false;
  setInterval(() => {
    if (isProcessing) {
      return;
    }

    isProcessing = true;
    processBatch(db, batchSize, dryRun).finally(() => {
      isProcessing = false;
    });
  }, frequency);
}

async function processBatch(db: DBClient, batchSize: number, dryRun: boolean): Promise<void> {
  try {
    const watchers = await db.getWatchers(batchSize);
    logger.debug(`processing ${watchers.length} watchers`);

    await Promise.allSettled(watchers.map((w) => processWatcher(db, w, dryRun)));
  } catch (err) {
    logger.error("failed to process watchers", "error", err);
  }
}

async function processWatcher(
  db: DBClient,
  watcher: Watcher,
  dryRun: boolean
): Promise<void> {
  logger.debug("processing watcher", "watcher", watcher.id);
  logger.debug("searching vinted with watcher query");

  const results = await searchVinted(watcher.query);

  const knownProducts = await db.getProducts(watcher.id);
  // build a list of all known ids
  const knownIDs = new Set(knownProducts.map((k) => k.vinted_id));

  // keep from results items we never saw before
  const newItems = results.filter((result) => !knownIDs.has(result.id));

  // send email for this user and this watcher
  if (newItems.length === 0) {
    logger.debug(
      "no new items found for watcher, nothing to do",
      "watcher",
      watcher.id
    );
    return;
  }

  logger.debug("new items found, sending email notification");
  mailService.send(
    newItems,
    [
      {
        email: watcher.email,
      },
    ],
    dryRun
  );

  logger.debug(
    `adding ${newItems.length} new products to known database for current watcher`
  );

  // write new items to s.db so that they're "known" now
  await db.createProducts(
    newItems.map((item) => {
      return {
        vinted_id: item.id,
        watcher_id: watcher.id,
      };
    })
  );

  // remove previously seen items that no longer appear in this search
  const obsoleteProducts = knownProducts.filter((known) => {
    const isInResults = results.find((result) => result.id === known.vinted_id);
    return isInResults;
  });

  try {
    logger.debug(
      "delete obsolete known products for watcher",
      "removed",
      obsoleteProducts
    );
    await db.deleteProducts(obsoleteProducts);
  } catch (err) {
    logger.error("failed to delete obsolete products", "error", err);
  }
}
