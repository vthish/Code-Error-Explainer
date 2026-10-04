import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { FileDatabase } from './fileStore.js';

export interface AnyDatabase {
  exec(sql: string): void;
  pragma(pragmaStr: string): any;
  prepare(sql: string): {
    run(...params: any[]): { changes: number };
    get(...params: any[]): any;
    all(...params: any[]): any[];
  };
  close(): void;
}

let dbInstance: AnyDatabase | null = null;

export function getDatabase(): AnyDatabase {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = path.resolve(process.cwd(), env.DATABASE_PATH);
  const dir = path.dirname(dbPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info(`Created database directory at: ${dir}`);
  }

  try {
    const sqliteDb = new Database(dbPath);
    sqliteDb.pragma('journal_mode = WAL');
    sqliteDb.pragma('foreign_keys = ON');

    logger.info(`Connected to SQLite database at: ${dbPath}`);
    dbInstance = sqliteDb;
    return dbInstance;
  } catch (err: any) {
    logger.warn(`Native SQLite load failed (${err?.code || err?.message || 'unknown'}). Falling back to resilient JSON storage engine.`, {
      error: err?.message,
    });
    dbInstance = new FileDatabase(dbPath);
    logger.info(`Resilient JSON database initialized at: ${dbPath.replace(/\.db$/, '')}_store.json`);
    return dbInstance;
  }
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    logger.info('Closed database connection.');
  }
}
