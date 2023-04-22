type Context = Record<string, unknown>;

export enum logLvl {
  "debug" = 0,
  "info" = 1,
  "warning" = 2,
  "error" = 3,
}

export class Logger {
  verbosity: logLvl;
  context: Context;

  constructor(ctx: Context, lvl: logLvl) {
    this.context = ctx;
    this.verbosity = lvl;
  }

  log(level: logLvl, msg: string, ...args: any[]) {
    const payload: Record<string, any> = {
      severity: level,
      message: msg,
      datetime: new Date(),
      timestamp: Date.now(),
      ...this.context,
    };

    if (args.length % 2 === 1) {
      args.push("N/C");
    }

    for (let i = 0; i < args.length; i = i + 2) {
      payload[args[i]] = args[i + 1];
    }

    console.log(JSON.stringify(payload));
  }

  with(ctx: Context) {
    return new Logger({ ...this.context, ...ctx }, this.verbosity);
  }

  debug(msg: string, ...args: unknown[]) {
    if (this.verbosity <= logLvl.debug) {
      this.log(logLvl.debug, msg, ...args);
    }
  }

  info(msg: string, ...args: unknown[]) {
    if (this.verbosity <= logLvl.info) {
      this.log(logLvl.info, msg, ...args);
    }
  }

  warn(msg: string, ...args: unknown[]) {
    if (this.verbosity <= logLvl.warning) {
      this.log(logLvl.warning, msg, ...args);
    }
  }

  error(msg: string, ...args: unknown[]) {
    if (this.verbosity <= logLvl.error) {
      this.log(logLvl.error, msg, ...args);
    }
  }
}

export const defaultLogger = new Logger({}, logLvl.info);

export function getLogLevel(lvl: string): logLvl {
  switch (lvl) {
    case "debug":
      return logLvl.debug;
    case "info":
      return logLvl.info;
    case "warning":
      return logLvl.warning;
    case "error":
      return logLvl.error;
    default:
      return logLvl.info;
  }
}
