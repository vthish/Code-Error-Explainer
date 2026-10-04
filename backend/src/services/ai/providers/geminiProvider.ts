import { AIProvider, AnalysisInput, AIAnalysisResult, ChatContext, ChatMessage } from '../types.js';
import { env } from '../../../config/env.js';
import { buildSystemPrompt, buildUserPrompt } from '../prompt.js';
import { parseAIResponse } from '../parser.js';
import { AppError } from '../../../errors/AppError.js';
import { MockAIProvider } from './mockProvider.js';
import { logger } from '../../../utils/logger.js';

const FALLBACK_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.7-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
];

function getCandidateModels(): string[] {
  const primary = (env.GEMINI_MODEL || 'gemini-3.5-flash').trim();
  const list = [primary, ...FALLBACK_MODELS];
  return [...new Set(list.filter(Boolean))];
}

export class GeminiProvider implements AIProvider {
  public readonly name = 'gemini';

  async analyzeError(input: AnalysisInput): Promise<AIAnalysisResult> {
    if (!env.GEMINI_API_KEY) {
      logger.warn('Gemini API key is missing. Falling back to Mock Provider.');
      return new MockAIProvider().analyzeError(input);
    }

    const candidateModels = getCandidateModels();
    let lastError: Error | null = null;

    for (const model of candidateModels) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), env.AI_REQUEST_TIMEOUT_SECONDS * 1000);

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${buildSystemPrompt()}\n\n${buildUserPrompt(input)}` },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json',
            },
          }),
        });

        if (response.status === 429 || response.status === 503 || response.status === 404) {
          const errText = await response.text();
          logger.warn(`Gemini model ${model} unavailable (${response.status}): ${errText.slice(0, 120)}. Trying fallback model...`);
          lastError = new Error(`Model ${model} status ${response.status}`);
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          logger.warn(`Gemini model ${model} request failed (${response.status}): ${errorText.slice(0, 120)}`);
          lastError = new Error(`Gemini API request failed (${response.status})`);
          continue;
        }

        const data = (await response.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!content) {
          logger.warn(`Gemini model ${model} returned empty content.`);
          continue;
        }

        return parseAIResponse(content);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          logger.warn(`Gemini request with model ${model} timed out. Trying fallback model...`);
        } else {
          logger.warn(`Gemini model ${model} error: ${error instanceof Error ? error.message : String(error)}`);
        }
        lastError = error instanceof Error ? error : new Error(String(error));
      } finally {
        clearTimeout(timeoutId);
      }
    }

    logger.warn('All Gemini models hit quota or are temporarily unavailable. Seamlessly using smart Mock fallback.');
    try {
      return await new MockAIProvider().analyzeError(input);
    } catch {
      throw AppError.aiProviderError(lastError ? lastError.message : 'All Gemini models temporarily unavailable.');
    }
  }

  async chat(context: ChatContext, messages: ChatMessage[]): Promise<string> {
    if (!env.GEMINI_API_KEY) {
      return new MockAIProvider().chat(context, messages);
    }

    const systemPrompt = `You are an expert AI software debugging assistant helping a developer fix an error.
Context:
- Error Type: ${context.error_type || 'Unknown'}
- Language: ${context.language || 'Auto-detected'}
- Error Log: ${context.error_text}
- Summary: ${context.summary || ''}
- Likely Cause: ${context.likely_cause || ''}
- Proposed Fix: ${context.fixed_code || 'N/A'}

Provide concise, friendly, and practical developer assistance. Use markdown code snippets with language tags where appropriate.`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }],
      },
      {
        role: 'model',
        parts: [{ text: 'Understood. I have reviewed the error analysis and am ready to answer any questions or help you debug.' }],
      },
      ...messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
    ];

    const candidateModels = getCandidateModels();

    for (const model of candidateModels) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents, generationConfig: { temperature: 0.3 } }),
        });

        if (response.status === 429 || response.status === 503 || response.status === 404) {
          logger.warn(`Gemini chat with ${model} returned ${response.status}. Trying next model...`);
          continue;
        }

        if (!response.ok) {
          logger.warn(`Gemini chat with ${model} failed with ${response.status}`);
          continue;
        }

        const data = (await response.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } catch (error) {
        logger.warn(`Gemini chat error with ${model}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    logger.warn('All Gemini chat models unavailable. Falling back to smart mock response.');
    return new MockAIProvider().chat(context, messages);
  }

  async healthCheck(): Promise<boolean> {
    return Boolean(env.GEMINI_API_KEY);
  }
}
