import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

let dbInstance: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = path.resolve(process.cwd(), env.DATABASE_PATH);
  const dir = path.dirname(dbPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info(`Created database directory at: ${dir}`);
  }

  dbInstance = new Database(dbPath);
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('foreign_keys = ON');

  logger.info(`Connected to SQLite database at: ${dbPath}`);
  return dbInstance;
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    logger.info('Closed SQLite database connection.');
  }
}
