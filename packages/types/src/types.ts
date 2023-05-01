import { z } from "zod";

export const zWatcher = z.object({
  crawled_at: z.string().datetime().optional(),
  email: z.string().email(),
  query: z.string(),
  id: z.number(),
});
export type Watcher = z.infer<typeof zWatcher>;

export const zCreateWatcherRequest = z.object({
  watcher: zWatcher.omit({
    id: true,
    crawled_at: true,
  }),
});
export type CreateWatcherRequest = z.infer<typeof zCreateWatcherRequest>;

export const zCreateWatcherResponse = z.object({
  data: z.object({
    watcher: zWatcher,
  }),
});
export type CreateWatcherResponse = z.infer<typeof zCreateWatcherResponse>;

export const zUpdateWatcherRequest = z.object({
  watcher: zWatcher.partial(),
});
export type UpdateWatcherRequest = z.infer<typeof zUpdateWatcherRequest>;

export const zUpdateWatcherResponse = zCreateWatcherResponse;
export type UpdateWatcherResponse = z.infer<typeof zUpdateWatcherResponse>;

export const zProduct = z.object({
  id: z.number(),
  vinted_id: z.number(),
  watcher_id: z.number(),
});
export type Product = z.infer<typeof zProduct>;

export const zGetWatchersResponse = z.object({
  data: z.object({
    watchers: z.array(zWatcher),
  }),
});
export type GetWatchersResponse = z.infer<typeof zGetWatchersResponse>;
