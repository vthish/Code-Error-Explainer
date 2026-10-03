import { z } from 'zod';
import { env } from '../config/env.js';

export const createAnalysisSchema = z.object({
  error_text: z
    .string({ required_error: 'The error_text field is required.' })
    .trim()
    .min(1, 'The submitted error text cannot be empty.')
    .max(
      env.MAX_ERROR_INPUT_LENGTH,
      `The submitted error text exceeds the maximum allowed length of ${env.MAX_ERROR_INPUT_LENGTH} characters.`
    ),

  language: z.string().trim().max(100).optional(),
  framework: z.string().trim().max(100).optional(),
  environment: z.string().trim().max(100).optional(),
  os: z.string().trim().max(100).optional(),
  code_context: z.string().trim().max(5000).optional(),
});

export type CreateAnalysisInput = z.infer<typeof createAnalysisSchema>;
