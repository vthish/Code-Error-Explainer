import { z } from 'zod';
import { AIAnalysisResult } from './types.js';
import { logger } from '../../utils/logger.js';

const solutionItemSchema = z.object({
  title: z.string().default('Apply Recommended Fix'),
  description: z.string().default('Review the error explanation and apply defensive coding checks.'),
});

const aiAnalysisSchema = z.object({
  error_type: z.string().default('Runtime Error'),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  detected_language: z.string().optional(),
  summary: z.string().default('An error occurred during application execution.'),
  explanation: z.string().default('The application encountered an unexpected runtime failure.'),
  likely_cause: z.string().default('Variable or payload state was invalid when evaluated.'),
  important_lines: z.array(z.string()).default([]),
  possible_causes: z.array(z.string()).default([]),
  solutions: z.array(solutionItemSchema).default([]),
  fixed_code: z.string().nullable().optional().transform((val) => val ?? null),
  debug_steps: z.array(z.string()).default([]),
  confidence: z.enum(['low', 'medium', 'high']).default('medium'),
});

export function parseAIResponse(rawText: string): AIAnalysisResult {
  let cleaned = rawText.trim();

  // 1. Strip markdown code fences if model output ```json ... ```
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }

  // 2. Extract JSON object substring using regex if extra text surrounds JSON
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    cleaned = match[0];
  }

  try {
    const jsonParsed = JSON.parse(cleaned);
    const validated = aiAnalysisSchema.parse(jsonParsed);
    return validated;
  } catch (error) {
    logger.warn('Failed to parse AI JSON response directly. Triggering fallback parser.', {
      error: error instanceof Error ? error.message : String(error),
      rawTextSnippet: rawText.slice(0, 200),
    });

    return createFallbackResult(rawText);
  }
}

function createFallbackResult(rawText: string): AIAnalysisResult {
  return {
    error_type: 'Unknown Error',
    severity: 'medium',
    summary: 'The AI model returned an unstructured error explanation.',
    explanation: rawText.slice(0, 500) || 'Detailed analysis was unavailable.',
    likely_cause: 'The exact root cause could not be automatically structured.',
    important_lines: [],
    possible_causes: ['Unstructured model response', 'Non-standard log format'],
    solutions: [
      {
        title: 'Inspect Raw Log',
        description: 'Check the error stack trace manually and verify variable definitions.',
      },
    ],
    fixed_code: null,
    debug_steps: ['Check application logs', 'Inspect recent code changes'],
    confidence: 'low',
  };
}
