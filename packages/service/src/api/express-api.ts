import express from "express";
import process from "node:process";
import { logger } from "../logger.js";
import { DBClient } from "../database/database.js";
import { Logger } from "@squirreled/logger";
import {
  CreateWatcherResponse,
  GetWatchersResponse,
  UpdateWatcherResponse,
  Watcher,
  zCreateWatcherRequest,
  zUpdateWatcherRequest,
} from "@squirreled/types/build/types.js";

const port = process.env.PORT ?? 3000;
const app = express();

app.use(express.json());
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error("unhandled error", "err", err);
    writeErr(res, 500, new Error("internal error"));
  }
);

app.use(
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.debug(
      "incoming request",
      "method",
      req.method,
      "path",
      req.path,
      "body",
      req.body
    );

    next();
  }
);

app.use(
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    next();

    logger.debug(
      "response sent",
      "method",
      req.method,
      "path",
      req.path,
      "status",
      res.statusCode
    );
  }
);

type Context = {
  db: DBClient;
  logger: Logger;
};

function boot(db: DBClient) {
  const ctx: Context = {
    db: db,
    logger: logger,
  };

  app.get("/watchers", withContext(ctx)(getWatchers));
  app.post("/watchers", withContext(ctx)(createWatcher));
  app.post("/watchers/:id", withContext(ctx)(updateWatcher));
  app.delete("/watchers/:id", withContext(ctx)(deleteWatcher));

  app.listen(port, () => {
    logger.info("API server started", "port", port);
  });
}

function withContext(ctx: Context) {
  return function contextAware<T extends (...args: any[]) => any>(handler: T) {
    return function (...args: Parameters<T>): ReturnType<T> {
      return handler(ctx, ...args);
    };
  };
}

function getWatchers(
  ctx: Context,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const watchers = ctx.db.getAllWatchers();

  const response: GetWatchersResponse = {
    data: {
      watchers,
    },
  };

  res.json(response);
}

function createWatcher(
  ctx: Context,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const body = zCreateWatcherRequest.parse(req.body);

  const newWatcher: Watcher = ctx.db.createWatcher(body.watcher);

  const response: CreateWatcherResponse = { data: { watcher: newWatcher } };

  res.json(response);
}

function updateWatcher(
  ctx: Context,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const payload = zUpdateWatcherRequest.parse(req.body);
  // get watcher from db
  const watcher = ctx.db.getWatcher(Number(req.params.id));

  // build updated watcher definition
  const newWatcher: Watcher = {
    ...watcher,
    ...payload.watcher,
  };

  // save new watcher definition to db
  ctx.db.updateWatcher(newWatcher);

  const response: UpdateWatcherResponse = {
    data: {
      watcher: newWatcher,
    },
  };
  // answer with updated watcher
  res.json(response);
}

function deleteWatcher(
  ctx: Context,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const id = req.params.id;
  if (id.length === 0) {
    writeErr(res, 400, new Error("missing watcher id"));
  }

  ctx.db.deleteWatcher(Number(id));

  writeAck(res);
}

function writeAck(res: express.Response) {
  res.json({ ack: true });
}
function writeErr(res: express.Response, code: number, err: Error) {
  logger.error("error response", "code", code, "err", err);
  res.status(code).json({
    code: err.name,
    message: err.message,
  });
}

export const Api = { boot };
