import { AIProvider } from './types.js';
import { env } from '../../config/env.js';
import { MockAIProvider } from './providers/mockProvider.js';
import { OpenAIProvider } from './providers/openaiProvider.js';
import { GeminiProvider } from './providers/geminiProvider.js';
import { AnthropicProvider } from './providers/anthropicProvider.js';
import { logger } from '../../utils/logger.js';

let cachedProvider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  const providerType = env.AI_PROVIDER;

  switch (providerType) {
    case 'openai':
      logger.info('Initializing OpenAI AI Provider');
      cachedProvider = new OpenAIProvider();
      break;
    case 'gemini':
      logger.info('Initializing Google Gemini AI Provider');
      cachedProvider = new GeminiProvider();
      break;
    case 'anthropic':
      logger.info('Initializing Anthropic Claude AI Provider');
      cachedProvider = new AnthropicProvider();
      break;
    case 'mock':
    default:
      logger.info('Initializing Mock AI Provider');
      cachedProvider = new MockAIProvider();
      break;
  }

  return cachedProvider;
}

export function resetAIProviderCache(): void {
  cachedProvider = null;
}
