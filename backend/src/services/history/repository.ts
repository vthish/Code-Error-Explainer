import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../../database/connection.js';
import { AIAnalysisResult, AnalysisInput } from '../ai/types.js';

export interface SavedAnalysisRecord {
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
}

export interface AnalysisResponseDTO {
  id: string;
  user_id?: string | null;
  error_text: string;
  language?: string | null;
  framework?: string | null;
  environment?: string | null;
  os?: string | null;
  code_context?: string | null;
  result: AIAnalysisResult;
  created_at: string;
}

export class HistoryRepository {
  static saveAnalysis(input: AnalysisInput, result: AIAnalysisResult, userId?: string | null): AnalysisResponseDTO {
    const db = getDatabase();
    const id = `anls_${uuidv4()}`;
    const createdAt = new Date().toISOString();
    const activeUserId = userId || null;

    const stmt = db.prepare(`
      INSERT INTO analyses (
        id, user_id, error_text, language, framework, environment, os, code_context,
        error_type, severity, summary, explanation, likely_cause, ai_result_json, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    stmt.run(
      id,
      activeUserId,
      input.error_text,
      input.language || null,
      input.framework || null,
      input.environment || null,
      input.os || null,
      input.code_context || null,
      result.error_type,
      result.severity,
      result.summary,
      result.explanation,
      result.likely_cause,
      JSON.stringify(result),
      createdAt,
      createdAt
    );

    return {
      id,
      user_id: activeUserId,
      error_text: input.error_text,
      language: input.language,
      framework: input.framework,
      environment: input.environment,
      os: input.os,
      code_context: input.code_context,
      result,
      created_at: createdAt,
    };
  }

  static getAnalyses(limit = 20, offset = 0, userId?: string | null): AnalysisResponseDTO[] {
    const db = getDatabase();
    let stmt;
    let rows: SavedAnalysisRecord[];

    if (userId) {
      stmt = db.prepare(`
        SELECT * FROM analyses
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `);
      rows = stmt.all(userId, limit, offset) as SavedAnalysisRecord[];
    } else {
      stmt = db.prepare(`
        SELECT * FROM analyses
        WHERE user_id IS NULL
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `);
      rows = stmt.all(limit, offset) as SavedAnalysisRecord[];
    }

    return rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      error_text: row.error_text,
      language: row.language,
      framework: row.framework,
      environment: row.environment,
      os: row.os,
      code_context: row.code_context,
      result: JSON.parse(row.ai_result_json) as AIAnalysisResult,
      created_at: row.created_at,
    }));
  }

  static getAnalysisById(id: string, userId?: string | null): AnalysisResponseDTO | null {
    const db = getDatabase();
    const stmt = db.prepare(`SELECT * FROM analyses WHERE id = ?`);
    const row = stmt.get(id) as SavedAnalysisRecord | undefined;

    if (!row) return null;
    if (userId && row.user_id && row.user_id !== userId) {
      return null; // Not authorized to view another user's private history
    }

    return {
      id: row.id,
      user_id: row.user_id,
      error_text: row.error_text,
      language: row.language,
      framework: row.framework,
      environment: row.environment,
      os: row.os,
      code_context: row.code_context,
      result: JSON.parse(row.ai_result_json) as AIAnalysisResult,
      created_at: row.created_at,
    };
  }

  static deleteAnalysis(id: string, userId?: string | null): boolean {
    const db = getDatabase();
    let stmt;
    if (userId) {
      stmt = db.prepare(`DELETE FROM analyses WHERE id = ? AND user_id = ?`);
      const result = stmt.run(id, userId);
      return result.changes > 0;
    } else {
      stmt = db.prepare(`DELETE FROM analyses WHERE id = ? AND user_id IS NULL`);
      const result = stmt.run(id);
      return result.changes > 0;
    }
  }
}

