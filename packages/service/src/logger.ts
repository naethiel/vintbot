import { defaultLogger, getLogLevel } from "logger";

defaultLogger.context = { app: "vinted_watcher" };
defaultLogger.logType =
  process.env.NODE_ENV === "production" ? "raw" : "pretty";
defaultLogger.verbosity = getLogLevel(process.env.LOG_LEVEL || "");

export const logger = defaultLogger.with({ module: "vintbot-service" });
