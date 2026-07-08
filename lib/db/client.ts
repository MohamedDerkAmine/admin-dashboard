import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

import * as schema from "./schema";

type DbInstance = {
  db: BetterSQLite3Database<typeof schema>;
  sqlite: Database.Database;
  path: string;
};

let instance: DbInstance | null = null;
let testDatabasePath: string | null = null;

export function getDatabasePath() {
  return resolve(
    testDatabasePath ??
      process.env.SQLITE_DATABASE_PATH ??
      join(process.cwd(), "data", "storeops.sqlite"),
  );
}

export function getDb() {
  return getDbInstance().db;
}

export function getSqlite() {
  return getDbInstance().sqlite;
}

export function withDatabasePathForTest<T>(databasePath: string, run: () => T): T {
  const previousPath = testDatabasePath;
  const previousInstance = instance;
  closeCurrentInstance();
  testDatabasePath = databasePath;
  try {
    return run();
  } finally {
    closeCurrentInstance();
    testDatabasePath = previousPath;
    instance = previousInstance;
  }
}

function getDbInstance(): DbInstance {
  const databasePath = getDatabasePath();
  if (instance?.path === databasePath) {
    return instance;
  }

  closeCurrentInstance();
  mkdirSync(dirname(databasePath), { recursive: true });
  const sqlite = new Database(databasePath);
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("journal_mode = WAL");
  runMigrations(sqlite);

  instance = {
    db: drizzle(sqlite, { schema }),
    sqlite,
    path: databasePath,
  };
  return instance;
}

function closeCurrentInstance() {
  instance?.sqlite.close();
  instance = null;
}

function runMigrations(sqlite: Database.Database) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      filename TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  const migrationsDir = join(process.cwd(), "db", "migrations");
  if (!existsSync(migrationsDir)) {
    return;
  }

  const applied = new Set(
    sqlite
      .prepare("SELECT filename FROM _migrations")
      .all()
      .map((row) => (row as { filename: string }).filename),
  );

  for (const filename of readdirSync(migrationsDir).sort()) {
    if (!filename.endsWith(".sql") || applied.has(filename)) {
      continue;
    }

    const sql = readFileSync(join(migrationsDir, filename), "utf8");
    const apply = sqlite.transaction(() => {
      sqlite.exec(sql);
      sqlite
        .prepare("INSERT INTO _migrations (filename, applied_at) VALUES (?, ?)")
        .run(filename, new Date().toISOString());
    });
    apply();
  }
}
