import sqlite3 from "sqlite3";
import * as sql from "sqlite";
import { Watcher, Product } from "../types.js";

type CreateWatcherPayload = {
  email: string;
  query: string;
};

export class DBClient {
  readonly path: string;
  readonly db: sql.Database;

  private constructor(path: string, db: sql.Database) {
    this.path = path;
    this.db = db;
  }

  public static async init(dbUrl: string): Promise<DBClient> {
    const bootstrap = await sql.open({
      filename: dbUrl,
      driver: sqlite3.Database,
    });

    return new DBClient(dbUrl, bootstrap);
  }

  async getAllWatchers(): Promise<Watcher[]> {
    return this.db.all<Watcher[]>(
      "SELECT id, query, email FROM watchers ORDER BY id"
    );
  }

  async getWatchers(size: number): Promise<Watcher[]> {
    return this.db.all<Watcher[]>(
      "SELECT id, query, email FROM watchers ORDER BY crawled_at ASC LIMIT ?",
      [size]
    );
  }

  async getWatcher(id: number): Promise<Watcher | undefined> {
    return this.db.get<Watcher>(
      "SELECT id, query, email, crawled_at FROM watchers WHERE id = ?",
      [id]
    );
  }

  async updateWatcher(w: Watcher): Promise<void> {
    await this.db.run("UPDATE watchers SET email = ?, query = ? WHERE id = ?", [
      w.email,
      w.query,
      w.id,
    ]);
  }

  async createWatcher(newWatcher: CreateWatcherPayload): Promise<Watcher> {
    const now = new Date().toISOString();

    const result = await this.db.get<Watcher>(
      "INSERT INTO watchers (query, email, crawled_at) VALUES (?, ?, ?) RETURNING id, query, email, crawled_at",
      [newWatcher.query, newWatcher.email, now]
    );

    if (!result) {
      throw new Error("could not read created watcher from DB");
    }

    return result;
  }

  async getProducts(watcherID: number): Promise<Product[]> {
    return this.db.all<Product[]>(
      `
    SELECT id, vinted_id, watcher_id
      FROM products
      WHERE watcher_id = ?
      `,
      [watcherID]
    );
  }

  async createProducts(
    products: { vinted_id: number; watcher_id: number }[]
  ): Promise<Product[]> {
    const stmt = await this.db.prepare(
      `
      INSERT INTO products (vinted_id, watcher_id)
      VALUES (?, ?)
      `
    );

    products.forEach((product) => {
      stmt.run([product.vinted_id, product.watcher_id]);
    });

    stmt.finalize();

    const items = await this.db.all<Product[]>(
      `
    SELECT id, vinted_id, watcher_id FROM products
    WHERE vinted_id IN (?)
    `,
      [products.map((p) => p.vinted_id)]
    );

    return items;
  }

  async deleteProducts(products: Product[]): Promise<void> {
    await this.db.exec(`DELETE FROM products WHERE id IN (?)`, [
      products.map((p) => p.id),
    ]);
  }
}
