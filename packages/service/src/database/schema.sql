CREATE TABLE IF NOT EXISTS watchers(
  id integer primary key autoincrement, 
  query text NOT NULL, 
  email text NOT NULL,
  crawled_at text
);
CREATE TABLE IF NOT EXISTS products(
  id integer PRIMARY KEY AUTOINCREMENT, 
  vinted_id integer NOT NULL,
  watcher_id integer NOT NULL, 
  FOREIGN KEY (watcher_id) 
    REFERENCES watchers (id)
      ON DELETE CASCADE
      ON UPDATE CASCADE
);
