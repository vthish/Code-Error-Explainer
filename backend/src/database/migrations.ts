import { getDatabase } from './connection.js';
import { logger } from '../utils/logger.js';

export function runMigrations(): void {
  const db = getDatabase();

  logger.info('Running database migrations...');

  db.exec(`
    CREATE TABLE IF NOT EXISTS analyses (
      id TEXT PRIMARY KEY NOT NULL,
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
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_analyses_error_type ON analyses(error_type);
  `);

  logger.info('Database migrations completed successfully.');
}
