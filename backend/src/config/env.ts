import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  APP_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_HOST: z.string().default('0.0.0.0'),
  APP_PORT: z.coerce.number().default(Number(process.env.PORT) || Number(process.env.APP_PORT) || 3001),
  FRONTEND_ORIGIN: z.string().default('http://localhost:5173'),
  
  DATABASE_PATH: z.string().default('./data/error_explainer.db'),
  
  AI_PROVIDER: z.enum(['mock', 'openai', 'gemini', 'anthropic']).default('mock'),
  
  OPENAI_API_KEY: z.string().optional().default(''),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_MODEL: z.string().default('gemini-1.5-flash'),
  
  ANTHROPIC_API_KEY: z.string().optional().default(''),
  ANTHROPIC_MODEL: z.string().default('claude-3-5-haiku-20241022'),
  
  AI_REQUEST_TIMEOUT_SECONDS: z.coerce.number().default(30),
  MAX_ERROR_INPUT_LENGTH: z.coerce.number().default(10000),
  RATE_LIMIT_REQUESTS: z.coerce.number().default(30),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
});

export type EnvConfig = z.infer<typeof envSchema>;

function loadEnv(): EnvConfig {
  const envData = {
    ...process.env,
    APP_PORT: process.env.PORT ? Number(process.env.PORT) : (process.env.APP_PORT ? Number(process.env.APP_PORT) : 3001),
  };
  const result = envSchema.safeParse(envData);
  if (!result.success) {
    console.error('Invalid environment configuration:', result.error.format());
    throw new Error('Invalid environment configuration');
  }
  return result.data;
}

export const env = loadEnv();
