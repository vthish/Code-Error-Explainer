import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../../database/connection.js';
import { AIAnalysisResult, AnalysisInput } from '../ai/types.js';

export interface SavedAnalysisRecord {
  id: string;
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
  static saveAnalysis(input: AnalysisInput, result: AIAnalysisResult): AnalysisResponseDTO {
    const db = getDatabase();
    const id = `anls_${uuidv4()}`;
    const createdAt = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO analyses (
        id, error_text, language, framework, environment, os, code_context,
        error_type, severity, summary, explanation, likely_cause, ai_result_json, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    stmt.run(
      id,
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

  static getAnalyses(limit = 20, offset = 0): AnalysisResponseDTO[] {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM analyses
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);

    const rows = stmt.all(limit, offset) as SavedAnalysisRecord[];

    return rows.map((row) => ({
      id: row.id,
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

  static getAnalysisById(id: string): AnalysisResponseDTO | null {
    const db = getDatabase();
    const stmt = db.prepare(`SELECT * FROM analyses WHERE id = ?`);
    const row = stmt.get(id) as SavedAnalysisRecord | undefined;

    if (!row) return null;

    return {
      id: row.id,
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

  static deleteAnalysis(id: string): boolean {
    const db = getDatabase();
    const stmt = db.prepare(`DELETE FROM analyses WHERE id = ?`);
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
