import Database from "better-sqlite3";
import { z } from "zod";

const zDbId = z.union([z.bigint(), z.number()]);
type DbId = z.infer<typeof zDbId>;
const zDbWatcher = z.object({
  id: zDbId,
  query: z.string(),
  email: z.string(),
  crawled_at: z.string().datetime().optional(),
});
type DbWatcher = z.infer<typeof zDbWatcher>;

const zDbProduct = z.object({
  id: zDbId,
  vinted_id: z.number(),
  watcher_id: z.number(),
});
type DbProduct = z.infer<typeof zDbProduct>;

type CreateWatcherPayload = {
  email: string;
  query: string;
};

type getProductsFilter = {
  watcherID?: DbId;
  IDs?: DbId[];
};

export class DBClient {
  readonly path: string;
  readonly db: Database.Database;

  constructor(path: string) {
    this.path = path;
    this.db = new Database(path);
    this.db.pragma("journal_mode = WAL");
  }

  getAllWatchers(): DbWatcher[] {
    const stmt = this.db.prepare(
      "SELECT id, query, email FROM watchers ORDER BY id"
    );
    const raw = stmt.all();
    const watchers = z.array(zDbWatcher);

    return watchers.parse(raw);
  }

  getWatchers(size: number): DbWatcher[] {
    const stmt = this.db.prepare<number>(
      "SELECT id, query, email FROM watchers ORDER BY crawled_at ASC LIMIT ?"
    );

    const raw = stmt.all(size);
    const results = z.array(zDbWatcher);

    return results.parse(raw);
  }

  getWatcher(id: DbId): DbWatcher {
    const stmt = this.db.prepare<[DbId]>(
      "SELECT id, query, email, crawled_at FROM watchers WHERE id = ?"
    );
    const raw = stmt.get(id);
    return zDbWatcher.parse(raw);
  }

  updateWatcher(w: DbWatcher): Database.RunResult {
    const stmt = this.db.prepare<[string, string, DbId]>(
      "UPDATE watchers SET email = ?, query = ? WHERE id = ?"
    );

    return stmt.run(w.email, w.query, w.id);
  }

  createWatcher(payload: CreateWatcherPayload): DbWatcher {
    const now = new Date().toISOString();

    const stmt = this.db.prepare<[string, string, string]>(
      "INSERT INTO watchers (query, email, crawled_at) VALUES (?, ?, ?)"
    );
    const result = stmt.run(payload.query, payload.email, now);

    return this.getWatcher(result.lastInsertRowid);
  }

  deleteWatcher(id: DbId) {
    const stmt = this.db.prepare<[DbId]>("DELETE FROM watchers WHERE id = ?");

    stmt.run(id);
  }

  getProducts(filter: getProductsFilter): DbProduct[] {
    let query = "SELECT id, vinted_id, watcher_id FROM products";

    let whereClauses: string[] = [];
    if (filter.IDs) {
      whereClauses.push("id IN (@ids)");
    }
    if (filter.watcherID) {
      whereClauses.push("watcher_id = @watcher_id");
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    const stmt = this.db.prepare<getProductsFilter>(query);

    const raw = stmt.all(filter);
    const products = z.array(zDbProduct);
    return products.parse(raw);
  }

  createProducts(
    payload: { vinted_id: number; watcher_id: DbId }[]
  ): DbProduct[] {
    const stmt = this.db.prepare<(typeof payload)[number]>(`
        INSERT INTO products (vinted_id, watcher_id)
        VALUES (@vinted_id, @watcher_id)
    `);

    let createdIds: DbId[] = [];
    const insertMany = this.db.transaction((products: typeof payload) => {
      for (const product of products) {
        const result = stmt.run(product);
        createdIds.push(result.lastInsertRowid);
      }
    });

    insertMany(payload);

    return this.getProducts({ IDs: createdIds });
  }

  deleteProducts(productIds: DbId[]) {
    const stmt = this.db.prepare<[DbId]>(
      "DELETE FROM products WHERE id IN (?)"
    );

    const deleteMany = this.db.transaction((ids) => {
      ids.forEach((id: DbId) => {
        stmt.run(id);
      });
    });

    deleteMany(productIds);
  }
}
