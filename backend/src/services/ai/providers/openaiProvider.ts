import { AIProvider, AnalysisInput, AIAnalysisResult } from '../types.js';
import { env } from '../../../config/env.js';
import { buildSystemPrompt, buildUserPrompt } from '../prompt.js';
import { parseAIResponse } from '../parser.js';
import { AppError } from '../../../errors/AppError.js';

export class OpenAIProvider implements AIProvider {
  public readonly name = 'openai';

  async analyzeError(input: AnalysisInput): Promise<AIAnalysisResult> {
    if (!env.OPENAI_API_KEY) {
      throw AppError.aiProviderError('OpenAI API key is missing. Set OPENAI_API_KEY in environment.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), env.AI_REQUEST_TIMEOUT_SECONDS * 1000);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: env.OPENAI_MODEL,
          messages: [
            { role: 'system', content: buildSystemPrompt() },
            { role: 'user', content: buildUserPrompt(input) },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw AppError.aiProviderError(`OpenAI API request failed (${response.status}): ${errorText}`);
      }

      const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw AppError.aiProviderError('OpenAI returned an empty content response.');
      }

      return parseAIResponse(content);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw AppError.aiProviderError(`OpenAI request timed out after ${env.AI_REQUEST_TIMEOUT_SECONDS} seconds.`);
      }
      if (error instanceof AppError) throw error;
      throw AppError.aiProviderError(`OpenAI provider failure: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async healthCheck(): Promise<boolean> {
    return Boolean(env.OPENAI_API_KEY);
  }
}
