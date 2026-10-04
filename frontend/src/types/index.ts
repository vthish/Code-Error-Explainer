export interface AnalysisInput {
  error_text: string;
  language?: string;
  framework?: string;
  environment?: string;
  os?: string;
  code_context?: string;
}

export interface SolutionItem {
  title: string;
  description: string;
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface AIAnalysisResult {
  error_type: string;
  severity: ErrorSeverity;
  summary: string;
  explanation: string;
  likely_cause: string;
  important_lines: string[];
  possible_causes: string[];
  solutions: SolutionItem[];
  fixed_code: string | null;
  debug_steps: string[];
  confidence: ConfidenceLevel;
}

export interface AnalysisRecordDTO {
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

export interface HistoryListResponse {
  data: AnalysisRecordDTO[];
  pagination: {
    limit: number;
    offset: number;
    count: number;
  };
}

export interface APIErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string | null;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

