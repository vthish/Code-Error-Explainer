import { Request, Response, NextFunction } from 'express';
import { createAnalysisSchema } from '../schemas/analysis.js';
import { getAIProvider } from '../services/ai/factory.js';
import { HistoryRepository } from '../services/history/repository.ts';
import { redactSensitiveData } from '../utils/redaction.js';
import { AppError } from '../errors/AppError.js';
import { logger } from '../utils/logger.js';

export async function analyzeErrorHandler(req: Request, res: Response, next: NextFunction): void {
  try {
    const parseResult = createAnalysisSchema.safeParse(req.body);

    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      throw AppError.badRequest(issue?.message || 'Invalid input parameters.');
    }

    const inputData = parseResult.data;

    // Sanitize secrets from error text and optional code context
    const sanitizedErrorText = redactSensitiveData(inputData.error_text);
    const sanitizedCodeContext = inputData.code_context ? redactSensitiveData(inputData.code_context) : undefined;

    const sanitizedInput = {
      ...inputData,
      error_text: sanitizedErrorText,
      code_context: sanitizedCodeContext,
    };

    logger.info('Received error analysis request', {
      language: sanitizedInput.language,
      framework: sanitizedInput.framework,
      textLength: sanitizedInput.error_text.length,
    });

    const aiProvider = getAIProvider();
    const aiResult = await aiProvider.analyzeError(sanitizedInput);

    // Persist analysis to database
    const savedRecord = HistoryRepository.saveAnalysis(sanitizedInput, aiResult);

    res.status(200).json(savedRecord);
  } catch (error) {
    next(error);
  }
}

export async function reanalyzeHandler(req: Request, res: Response, next: NextFunction): void {
  try {
    const { id } = req.params;
    if (!id) {
      throw AppError.badRequest('Analysis ID is required.');
    }

    const existingRecord = HistoryRepository.getAnalysisById(id);
    if (!existingRecord) {
      throw AppError.notFound(`Analysis record with ID ${id} was not found.`);
    }

    const inputData = {
      error_text: existingRecord.error_text,
      language: existingRecord.language || undefined,
      framework: existingRecord.framework || undefined,
      environment: existingRecord.environment || undefined,
      os: existingRecord.os || undefined,
      code_context: existingRecord.code_context || undefined,
    };

    const aiProvider = getAIProvider();
    const newAiResult = await aiProvider.analyzeError(inputData);

    // Save as new analysis entry
    const savedRecord = HistoryRepository.saveAnalysis(inputData, newAiResult);

    res.status(200).json(savedRecord);
  } catch (error) {
    next(error);
  }
}
