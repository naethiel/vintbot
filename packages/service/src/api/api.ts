import {
  ZodTypeProvider,
  validatorCompiler,
  serializerCompiler,
} from "fastify-type-provider-zod";
import Fastify from "fastify";
import { z } from "zod";
import { zWatcher, zCreateWatcherPayload, Watcher } from "../types.js";

import { logger } from "../logger.js";
import { DBClient } from "../database/database.js";

export async function startAPI(db: DBClient): Promise<void> {
  const fastify = Fastify({
    logger: true,
  }).withTypeProvider<ZodTypeProvider>();

  // add sensible defaults and error shorthand methods
  fastify.register(import("@fastify/sensible"));
  // Add schema validator and serializer
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  fastify.get(
    "/watchers",
    {
      schema: {
        response: {
          200: z.object({
            watchers: z.array(zWatcher),
          }),
        },
      },
    },

    async (_req, repl) => {
      const watchers = await db.getAllWatchers();

      repl.send({ watchers });
    }
  );

  fastify.post(
    "/watchers",
    {
      schema: {
        body: z.object({
          watcher: zCreateWatcherPayload,
        }),
        response: {
          200: z.object({
            watcher: zWatcher,
          }),
        },
      },
    },
    async (request, reply) => {
      const { watcher } = request.body;

      const newWatcher = await db.createWatcher(watcher);
      if (!newWatcher) {
        reply.internalServerError();
      }

      reply.send({ watcher: newWatcher });
    }
  );

  fastify.post(
    "/watchers/:id",
    {
      schema: {
        body: z.object({
          watcher: zCreateWatcherPayload.partial(),
        }),
        params: z.object({
          id: z.string(),
        }),
        response: {
          200: z.object({
            watcher: zWatcher,
          }),
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
      reply.send({ watcher: newWatcher });
    }
  );

  const port = process.env.PORT;
  if (!port) {
    throw new Error("no port defined");
  }

  logger.info(`listening on port ${port}`);
  await fastify.listen({ port: Number(port), host: "0.0.0.0" });
}
