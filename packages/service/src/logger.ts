import { defaultLogger, getLogLevel } from "@vintbot/logger";

defaultLogger.context = { app: "vinted_watcher" };
defaultLogger.verbosity = getLogLevel(process.env.LOG_LEVEL || "");

export const logger = defaultLogger.with({ module: "vintbot-service" });
