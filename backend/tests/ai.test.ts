import { describe, it, expect } from 'vitest';
import { buildSystemPrompt, buildUserPrompt } from '../src/services/ai/prompt.js';
import { parseAIResponse } from '../src/services/ai/parser.js';
import { MockAIProvider } from '../src/services/ai/providers/mockProvider.js';
import { getAIProvider, resetAIProviderCache } from '../src/services/ai/factory.js';
import { env } from '../src/config/env.js';

describe('AI Integration Service Suite', () => {
  it('buildSystemPrompt returns JSON schema enforcement constraints', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('JSON OUTPUT SCHEMA');
    expect(prompt).toContain('DO NOT include any markdown formatting');
  });

  it('buildUserPrompt incorporates error text and optional environment context', () => {
    const prompt = buildUserPrompt({
      error_text: 'TypeError: undefined is not a function',
      language: 'JavaScript',
      framework: 'React',
      os: 'Ubuntu',
    });

    expect(prompt).toContain('TypeError: undefined is not a function');
    expect(prompt).toContain('Language: JavaScript');
    expect(prompt).toContain('Framework: React');
    expect(prompt).toContain('OS: Ubuntu');
  });

  it('parseAIResponse correctly parses valid minified JSON', () => {
    const sampleJson = JSON.stringify({
      error_type: 'Type Error',
      severity: 'high',
      summary: 'Undefined function call',
      explanation: 'Attempted to invoke variable as function',
      likely_cause: 'Variable is undefined',
      important_lines: ['TypeError: undefined is not a function'],
      possible_causes: ['Missing import'],
      solutions: [{ title: 'Verify function import', description: 'Import function before calling' }],
      fixed_code: 'import { foo } from "./foo";',
      debug_steps: ['Check imports'],
      confidence: 'high',
    });

    const parsed = parseAIResponse(sampleJson);
    expect(parsed.error_type).toBe('Type Error');
    expect(parsed.severity).toBe('high');
    expect(parsed.solutions).toHaveLength(1);
    expect(parsed.fixed_code).toBe('import { foo } from "./foo";');
  });

  it('parseAIResponse strips markdown ```json fences if outputted by model', () => {
    const fencedJson = `\`\`\`json
{
  "error_type": "Syntax Error",
  "severity": "low",
  "summary": "Missing semicolon",
  "explanation": "Line ended unexpectedly",
  "likely_cause": "Typo at end of statement",
  "important_lines": [],
  "possible_causes": [],
  "solutions": [],
  "fixed_code": null,
  "debug_steps": [],
  "confidence": "medium"
}
\`\`\``;

    const parsed = parseAIResponse(fencedJson);
    expect(parsed.error_type).toBe('Syntax Error');
    expect(parsed.confidence).toBe('medium');
  });

  it('parseAIResponse uses fallback generator when JSON is corrupted', () => {
    const invalidInput = 'This is plain text with no valid JSON response.';
    const parsed = parseAIResponse(invalidInput);

    expect(parsed.error_type).toBe('Unknown Error');
    expect(parsed.explanation).toContain('This is plain text');
    expect(parsed.confidence).toBe('low');
  });

  it('MockAIProvider returns structured result for TypeError', async () => {
    const mockProvider = new MockAIProvider();
    const result = await mockProvider.analyzeError({
      error_text: 'TypeError: Cannot read properties of undefined (reading "map")',
      language: 'TypeScript',
    });

    expect(result.error_type).toBe('Runtime Error');
    expect(result.summary).toContain('undefined or null value');
    expect(result.solutions[0].title).toContain('Optional Chaining');
  });

  it('getAIProvider returns default MockAIProvider when AI_PROVIDER=mock', () => {
    const originalProvider = env.AI_PROVIDER;
    try {
      (env as any).AI_PROVIDER = 'mock';
      resetAIProviderCache();
      const provider = getAIProvider();
      expect(provider.name).toBe('mock');
    } finally {
      (env as any).AI_PROVIDER = originalProvider;
      resetAIProviderCache();
    }
  });
});
