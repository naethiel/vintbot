import {
  ZodTypeProvider,
  validatorCompiler,
  serializerCompiler,
} from "fastify-type-provider-zod";
import Fastify from "fastify";
import { z } from "zod";
import {
  zCreateWatcherRequest,
  Watcher,
  zGetWatchersResponse,
  GetWatchersResponse,
  zCreateWatcherResponse,
  CreateWatcherResponse,
  zUpdateWatcherRequest,
  zUpdateWatcherResponse,
} from "../types.js";

import { logger } from "../logger.js";
import { DBClient } from "../database/database.js";
import cors, { OriginFunction } from "@fastify/cors";
import sensible from "@fastify/sensible";

const resolveCors: OriginFunction = (origin, cb) => {
  if (!origin) {
    cb(new Error("invalid origin"), false);
    return;
  }

  const hostname = new URL(origin).hostname;
  if (hostname === "localhost") {
    //  Request from localhost will pass
    cb(null, true);
    return;
  }
  // Generate an error on other origins, disabling access
  cb(new Error("Not allowed"), false);
};

export async function startAPI(db: DBClient): Promise<void> {
  const fastify = Fastify({
    logger: {
      enabled: true,
    },
  }).withTypeProvider<ZodTypeProvider>();

  // add sensible defaults and error shorthand methods
  fastify.register(sensible);
  fastify.register(cors, {
    origin: resolveCors,
  });

  // Add schema validator and serializer
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  fastify.get(
    "/watchers",
    {
      schema: {
        response: {
          200: zGetWatchersResponse,
        },
      },
    },

    async (_req, repl) => {
      const watchers = await db.getAllWatchers();

      const res: GetWatchersResponse = {
        data: { watchers: watchers },
      };
      repl.send(res);
    }
  );

  fastify.post(
    "/watchers",
    {
      schema: {
        body: zCreateWatcherRequest,
        response: {
          200: zCreateWatcherResponse,
        },
      },
    },
    async (request, reply) => {
      const newWatcher: Watcher = await db.createWatcher(request.body.watcher);
      if (!newWatcher) {
        reply.internalServerError();
      }

      const out: CreateWatcherResponse = { data: { watcher: newWatcher } };

      reply.send(out);
    }
  );

  fastify.post(
    "/watchers/:id",
    {
      schema: {
        body: zUpdateWatcherRequest,
        params: z.object({
          id: z.string(),
        }),
        response: {
          200: zUpdateWatcherResponse,
        },
      },
    },
    async (request, reply) => {
      // get watcher from db
      const watcher = await db.getWatcher(Number(request.params.id));
      if (!watcher) {
        reply.badRequest("no watcher with id");
        return;
      }

      // build updated watcher definition
      const newWatcher: Watcher = {
        ...watcher,
        ...request.body.watcher,
      };

      // save new watcher definition to db
      await db.updateWatcher(newWatcher);

      // answer with updated watcher
      reply.send({
        data: {
          watcher: newWatcher,
        },
      });
    }
  );

  const port = process.env.PORT;
  if (!port) {
    throw new Error("no port defined");
  }

  logger.info(`listening on port ${port}`);
  await fastify.listen({ port: Number(port), host: "0.0.0.0" });
}
