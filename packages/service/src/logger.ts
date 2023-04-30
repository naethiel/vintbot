import { defaultLogger, getLogLevel } from "@squirreled/logger";

defaultLogger.context = { app: "vinted_watcher" };
defaultLogger.verbosity = getLogLevel(process.env.LOG_LEVEL || "");

export const logger = defaultLogger.with({ module: "squirreled-service" });
