import { Logger, getLogLevel, logLvl } from "@squirreled/logger";

const defaultLogger = new Logger({}, logLvl.info);
defaultLogger.context = { app: "vinted_watcher" };
defaultLogger.verbosity = getLogLevel(process.env.LOG_LEVEL || "");

export const logger = defaultLogger.with({ module: "squirreled-service" });
