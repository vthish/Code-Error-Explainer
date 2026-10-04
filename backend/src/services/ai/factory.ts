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
    case 'gemini':
      if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== '' && !env.GEMINI_API_KEY.includes('your_gemini')) {
        logger.info('Initializing Google Gemini AI Provider');
        cachedProvider = new GeminiProvider();
      } else {
        logger.warn('Gemini API key not provided or placeholder used. Seamlessly using smart Mock AI Provider.');
        cachedProvider = new MockAIProvider();
      }
      break;
    case 'openai':
      if (env.OPENAI_API_KEY && env.OPENAI_API_KEY.trim() !== '' && !env.OPENAI_API_KEY.includes('your_openai')) {
        logger.info('Initializing OpenAI AI Provider');
        cachedProvider = new OpenAIProvider();
      } else {
        logger.warn('OpenAI API key not provided. Seamlessly using smart Mock AI Provider.');
        cachedProvider = new MockAIProvider();
      }
      break;
    case 'anthropic':
      if (env.ANTHROPIC_API_KEY && env.ANTHROPIC_API_KEY.trim() !== '' && !env.ANTHROPIC_API_KEY.includes('your_anthropic')) {
        logger.info('Initializing Anthropic Claude AI Provider');
        cachedProvider = new AnthropicProvider();
      } else {
        logger.warn('Anthropic API key not provided. Seamlessly using smart Mock AI Provider.');
        cachedProvider = new MockAIProvider();
      }
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
