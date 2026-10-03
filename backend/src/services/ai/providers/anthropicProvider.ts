import { AIProvider, AnalysisInput, AIAnalysisResult } from '../types.js';
import { env } from '../../../config/env.js';
import { buildSystemPrompt, buildUserPrompt } from '../prompt.js';
import { parseAIResponse } from '../parser.js';
import { AppError } from '../../../errors/AppError.js';

export class AnthropicProvider implements AIProvider {
  public readonly name = 'anthropic';

  async analyzeError(input: AnalysisInput): Promise<AIAnalysisResult> {
    if (!env.ANTHROPIC_API_KEY) {
      throw AppError.aiProviderError('Anthropic API key is missing. Set ANTHROPIC_API_KEY in environment.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), env.AI_REQUEST_TIMEOUT_SECONDS * 1000);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: env.ANTHROPIC_MODEL,
          max_tokens: 2000,
          system: buildSystemPrompt(),
          messages: [{ role: 'user', content: buildUserPrompt(input) }],
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw AppError.aiProviderError(`Anthropic API request failed (${response.status}): ${errorText}`);
      }

      const data = (await response.json()) as { content?: Array<{ text?: string }> };
      const content = data.content?.[0]?.text;

      if (!content) {
        throw AppError.aiProviderError('Anthropic returned an empty content response.');
      }

      return parseAIResponse(content);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw AppError.aiProviderError(`Anthropic request timed out after ${env.AI_REQUEST_TIMEOUT_SECONDS} seconds.`);
      }
      if (error instanceof AppError) throw error;
      throw AppError.aiProviderError(`Anthropic provider failure: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async healthCheck(): Promise<boolean> {
    return Boolean(env.ANTHROPIC_API_KEY);
  }
}
