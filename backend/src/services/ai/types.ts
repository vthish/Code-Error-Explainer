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

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatContext {
  error_text: string;
  error_type?: string;
  summary?: string;
  likely_cause?: string;
  fixed_code?: string | null;
  language?: string;
}

export interface AIProvider {
  name: string;
  analyzeError(input: AnalysisInput): Promise<AIAnalysisResult>;
  chat(context: ChatContext, messages: ChatMessage[]): Promise<string>;
  healthCheck(): Promise<boolean>;
}
