import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger.js';

interface StoreData {
  users: Array<{
    id: string;
    google_id: string | null;
    email: string;
    name: string;
    picture: string | null;
    created_at: string;
  }>;
  analyses: Array<{
    id: string;
    user_id: string | null;
    error_text: string;
    language: string | null;
    framework: string | null;
    environment: string | null;
    os: string | null;
    code_context: string | null;
    error_type: string;
    severity: string;
    summary: string;
    explanation: string;
    likely_cause: string;
    ai_result_json: string;
    created_at: string;
    updated_at: string;
  }>;
}

export class FileDatabase {
  private filePath: string;
  private data: StoreData = { users: [], analyses: [] };

  constructor(dbPath: string) {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.filePath = dbPath.replace(/\.db$/, '') + '_store.json';
    this.load();
  }

  private load(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.data.users) this.data.users = [];
        if (!this.data.analyses) this.data.analyses = [];
      } else {
        this.save();
      }
    } catch {
      this.data = { users: [], analyses: [] };
    }
  }

  private save(): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      logger.warn('Failed to write JSON database fallback:', { err });
    }
  }

  exec(_sql: string): void {
    // Schema DDL is handled in-memory in FileDatabase
  }

  pragma(pragmaStr: string): any {
    if (pragmaStr.includes('table_info(analyses)')) {
      return [{ name: 'user_id' }];
    }
    return [];
  }

  prepare(sql: string) {
    const trimmed = sql.trim().replace(/\s+/g, ' ');

    return {
      run: (...params: any[]) => {
        // 1. INSERT INTO users
        if (/^INSERT INTO users/i.test(trimmed)) {
          // VALUES (?, ?, ?, ?, ?, ?) -> id, google_id, email, name, picture, created_at
          const [id, google_id, email, name, picture, created_at] = params;
          const existing = this.data.users.find((u) => u.email === email || (google_id && u.google_id === google_id));
          if (!existing) {
            this.data.users.push({
              id,
              google_id: google_id || null,
              email,
              name,
              picture: picture || null,
              created_at: created_at || new Date().toISOString(),
            });
            this.save();
          }
          return { changes: 1 };
        }

        // 2. UPDATE users
        if (/^UPDATE users/i.test(trimmed)) {
          // SET name = ?, picture = COALESCE(?, picture) WHERE id = ?
          const [name, picture, id] = params;
          const user = this.data.users.find((u) => u.id === id);
          if (user) {
            user.name = name;
            if (picture) user.picture = picture;
            this.save();
            return { changes: 1 };
          }
          return { changes: 0 };
        }

        // 3. INSERT INTO analyses
        if (/^INSERT INTO analyses/i.test(trimmed)) {
          const [
            id,
            user_id,
            error_text,
            language,
            framework,
            environment,
            os,
            code_context,
            error_type,
            severity,
            summary,
            explanation,
            likely_cause,
            ai_result_json,
            created_at,
            updated_at,
          ] = params;

          this.data.analyses.unshift({
            id,
            user_id: user_id || null,
            error_text,
            language: language || null,
            framework: framework || null,
            environment: environment || null,
            os: os || null,
            code_context: code_context || null,
            error_type,
            severity,
            summary,
            explanation,
            likely_cause,
            ai_result_json,
            created_at: created_at || new Date().toISOString(),
            updated_at: updated_at || new Date().toISOString(),
          });
          this.save();
          return { changes: 1 };
        }

        // 4. DELETE FROM analyses WHERE id = ? AND user_id = ?
        if (/^DELETE FROM analyses/i.test(trimmed)) {
          const id = params[0];
          const userId = params[1] ?? null;
          const initialLen = this.data.analyses.length;
          this.data.analyses = this.data.analyses.filter((a) => {
            if (a.id !== id) return true;
            if (userId === null) return a.user_id !== null;
            return a.user_id !== userId;
          });
          const changed = initialLen - this.data.analyses.length;
          if (changed > 0) this.save();
          return { changes: changed };
        }

        return { changes: 0 };
      },

      get: (...params: any[]) => {
        // SELECT * FROM users WHERE google_id = ? OR email = ?
        if (/SELECT \* FROM users WHERE google_id = \? OR email = \?/i.test(trimmed)) {
          const [googleId, email] = params;
          return this.data.users.find((u) => (googleId && u.google_id === googleId) || u.email === email);
        }

        // SELECT * FROM users WHERE id = ?
        if (/SELECT \* FROM users WHERE id = \?/i.test(trimmed)) {
          const [id] = params;
          return this.data.users.find((u) => u.id === id);
        }

        // SELECT id FROM users WHERE id = ?
        if (/SELECT id FROM users WHERE id = \?/i.test(trimmed)) {
          const [id] = params;
          const found = this.data.users.find((u) => u.id === id);
          return found ? { id: found.id } : undefined;
        }

        // SELECT id FROM users WHERE email = ?
        if (/SELECT id FROM users WHERE email = \?/i.test(trimmed)) {
          const [email] = params;
          const found = this.data.users.find((u) => u.email === email);
          return found ? { id: found.id } : undefined;
        }

        // SELECT 1 FROM users WHERE id = ?
        if (/SELECT 1 FROM users WHERE id = \?/i.test(trimmed)) {
          const [id] = params;
          const found = this.data.users.find((u) => u.id === id);
          return found ? { 1: 1 } : undefined;
        }

        // SELECT * FROM analyses WHERE id = ?
        if (/SELECT \* FROM analyses WHERE id = \?/i.test(trimmed)) {
          const [id] = params;
          return this.data.analyses.find((a) => a.id === id);
        }

        return undefined;
      },

      all: (...params: any[]) => {
        // SELECT * FROM analyses WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?
        if (/SELECT \* FROM analyses WHERE user_id = \?/i.test(trimmed)) {
          const [userId, limit = 20, offset = 0] = params;
          return this.data.analyses
            .filter((a) => a.user_id === userId)
            .slice(offset, offset + limit);
        }

        // SELECT * FROM analyses WHERE user_id IS NULL ORDER BY created_at DESC LIMIT ? OFFSET ?
        if (/SELECT \* FROM analyses WHERE user_id IS NULL/i.test(trimmed)) {
          const [limit = 20, offset = 0] = params;
          return this.data.analyses
            .filter((a) => !a.user_id)
            .slice(offset, offset + limit);
        }

        return [];
      },
    };
  }

  close(): void {
    this.save();
  }
}
