import { AIProvider, AnalysisInput, AIAnalysisResult } from '../types.js';
import { env } from '../../../config/env.js';
import { buildSystemPrompt, buildUserPrompt } from '../prompt.js';
import { parseAIResponse } from '../parser.js';
import { AppError } from '../../../errors/AppError.js';

export class GeminiProvider implements AIProvider {
  public readonly name = 'gemini';

  async analyzeError(input: AnalysisInput): Promise<AIAnalysisResult> {
    if (!env.GEMINI_API_KEY) {
      throw AppError.aiProviderError('Gemini API key is missing. Set GEMINI_API_KEY in environment.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), env.AI_REQUEST_TIMEOUT_SECONDS * 1000);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;

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

      if (!response.ok) {
        const errorText = await response.text();
        throw AppError.aiProviderError(`Gemini API request failed (${response.status}): ${errorText}`);
      }

      const data = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        throw AppError.aiProviderError('Gemini returned an empty content response.');
      }

      return parseAIResponse(content);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw AppError.aiProviderError(`Gemini request timed out after ${env.AI_REQUEST_TIMEOUT_SECONDS} seconds.`);
      }
      if (error instanceof AppError) throw error;
      throw AppError.aiProviderError(`Gemini provider failure: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async healthCheck(): Promise<boolean> {
    return Boolean(env.GEMINI_API_KEY);
  }
}
