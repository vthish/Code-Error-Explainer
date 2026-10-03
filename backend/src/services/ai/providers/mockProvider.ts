import { AIProvider, AnalysisInput, AIAnalysisResult } from '../types.js';

export class MockAIProvider implements AIProvider {
  public readonly name = 'mock';

  async analyzeError(input: AnalysisInput): Promise<AIAnalysisResult> {
    const errorText = input.error_text.toLowerCase();

    // Context-sensitive mock responses based on input text
    if (errorText.includes('cannot read properties of undefined') || errorText.includes('null pointer')) {
      return {
        error_type: 'Runtime Error',
        severity: 'medium',
        summary: 'The application attempted to access a property on an undefined or null value.',
        explanation:
          'In JavaScript/TypeScript, dereferencing a property on a variable that evaluates to undefined or null triggers a TypeError at runtime.',
        likely_cause: 'The target object or API response has not finished loading when property access occurred.',
        important_lines: [input.error_text.split('\n')[0] || 'TypeError: Cannot read properties of undefined'],
        possible_causes: [
          'Asynchronous data fetch is still pending.',
          'Property key name is misspelled or missing in object payload.',
          'Initial state was declared as undefined instead of null or default object.',
        ],
        solutions: [
          {
            title: 'Use Optional Chaining (?.) & Nullish Coalescing (??)',
            description: 'Guard property access with optional chaining and provide a default fallback value.',
          },
        ],
        fixed_code: input.code_context
          ? `// Defensive fix:\nconst safeData = data?.items ?? [];`
          : `const value = object?.property ?? 'default_value';`,
        debug_steps: [
          'Log the target variable prior to property access.',
          'Verify API response network tab payload structure.',
          'Ensure loading state is handled before rendering dependant UI.',
        ],
        confidence: 'high',
      };
    }

    if (errorText.includes('syntaxerror') || errorText.includes('unexpected token')) {
      return {
        error_type: 'Syntax Error',
        severity: 'high',
        summary: 'The code parser encountered invalid language syntax.',
        explanation: 'Syntax errors occur when code breaks language grammar rules, such as missing brackets or quotes.',
        likely_cause: 'Missing closing parenthesis, curly brace, or unexpected character.',
        important_lines: [input.error_text.split('\n')[0] || 'SyntaxError: Unexpected token'],
        possible_causes: ['Missing closing bracket/parenthesis', 'Trailing comma in strict JSON', 'Invalid character string'],
        solutions: [
          {
            title: 'Fix Syntax Mismatch',
            description: 'Inspect the line indicated in the error and verify matching brackets and quotes.',
          },
        ],
        fixed_code: null,
        debug_steps: ['Check line number in stack trace', 'Use an IDE syntax highlighter'],
        confidence: 'high',
      };
    }

    // Generic fallback mock response
    return {
      error_type: input.language ? `${input.language} Error` : 'Runtime Error',
      severity: 'medium',
      summary: `An error occurred while executing ${input.language || 'application'} code.`,
      explanation: 'The provided log indicates an unhandled runtime exception during execution.',
      likely_cause: 'State mismatch or unhandled exception path in execution.',
      important_lines: [input.error_text.slice(0, 150)],
      possible_causes: ['Unexpected payload schema', 'Environment configuration mismatch'],
      solutions: [
        {
          title: 'Add Defensive Validation',
          description: 'Validate input arguments and handle potential error branches explicitly.',
        },
      ],
      fixed_code: null,
      debug_steps: ['Check application execution logs', 'Reproduce locally with debug logs enabled'],
      confidence: 'medium',
    };
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}
