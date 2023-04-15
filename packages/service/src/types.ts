import { z } from "zod";

export const zWatcher = z.object({
  crawled_at: z.string().datetime().optional(),
  email: z.string().email(),
  query: z.string(),
  id: z.number(),
});

export type Watcher = z.infer<typeof zWatcher>;

export const zCreateWatcherPayload = zWatcher.omit({
  id: true,
  crawled_at: true,
});

export type CreateWatcherPayload = z.infer<typeof zCreateWatcherPayload>;

export const zProduct = z.object({
  id: z.number(),
  vinted_id: z.number(),
  watcher_id: z.number(),
});

export type Product = z.infer<typeof zProduct>;
