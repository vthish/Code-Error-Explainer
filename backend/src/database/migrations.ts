import { getDatabase } from './connection.js';
import { logger } from '../utils/logger.js';

export function runMigrations(): void {
  const db = getDatabase();

  logger.info('Running database migrations...');

  // 1. Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      google_id TEXT UNIQUE,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      picture TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 2. Create analyses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS analyses (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT,
      error_text TEXT NOT NULL,
      language TEXT,
      framework TEXT,
      environment TEXT,
      os TEXT,
      code_context TEXT,
      error_type TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'medium',
      summary TEXT NOT NULL,
      explanation TEXT NOT NULL,
      likely_cause TEXT NOT NULL,
      ai_result_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  // 3. Migration step: ensure user_id column exists if table was created in an older version
  try {
    const tableInfo = db.pragma('table_info(analyses)') as Array<{ name: string }>;
    const hasUserId = tableInfo.some((col) => col.name === 'user_id');
    if (!hasUserId) {
      db.exec('ALTER TABLE analyses ADD COLUMN user_id TEXT REFERENCES users(id);');
      logger.info('Added user_id column to analyses table.');
    }
  } catch (err) {
    logger.warn('User ID migration check warning:', { error: String(err) });
  }

  // 4. Create indexes after ensuring all columns exist
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_analyses_error_type ON analyses(error_type);
    CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
  `);

  logger.info('Database migrations completed successfully.');
}

