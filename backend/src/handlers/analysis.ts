import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { createAnalysisSchema } from '../schemas/analysis.js';
import { getAIProvider } from '../services/ai/factory.js';
import { HistoryRepository } from '../services/history/repository.js';
import { redactSensitiveData } from '../utils/redaction.js';
import { detectLanguage } from '../utils/languageDetector.js';
import { AppError } from '../errors/AppError.js';
import { logger } from '../utils/logger.js';

export async function analyzeErrorHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
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

    const userId = req.user?.id || null;

    logger.info('Received error analysis request', {
      language: sanitizedInput.language,
      framework: sanitizedInput.framework,
      textLength: sanitizedInput.error_text.length,
      userId: userId || 'guest',
    });

    const aiProvider = getAIProvider();
    const aiResult = await aiProvider.analyzeError(sanitizedInput);

    // Persist analysis to database with auto-detected language if not explicitly provided
    const detectedLang = sanitizedInput.language || aiResult.detected_language || detectLanguage(sanitizedInput.error_text, sanitizedInput.code_context) || undefined;
    const effectiveLanguage = detectedLang;
    if (!aiResult.detected_language && detectedLang) {
      aiResult.detected_language = detectedLang;
    }
    const finalInput = {
      ...sanitizedInput,
      language: effectiveLanguage,
    };
    const savedRecord = HistoryRepository.saveAnalysis(finalInput, aiResult, userId);

    res.status(200).json(savedRecord);
  } catch (error) {
    next(error);
  }
}

export async function reanalyzeHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const userId = req.user?.id || null;

    if (!id) {
      throw AppError.badRequest('Analysis ID is required.');
    }

    const existingRecord = HistoryRepository.getAnalysisById(id, userId);
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

    const detectedLang = inputData.language || newAiResult.detected_language || detectLanguage(inputData.error_text, inputData.code_context) || undefined;
    const finalInputData = {
      ...inputData,
      language: detectedLang,
    };
    if (!newAiResult.detected_language && detectedLang) {
      newAiResult.detected_language = detectedLang;
    }

    // Save as new analysis entry
    const savedRecord = HistoryRepository.saveAnalysis(finalInputData, newAiResult, userId);

    res.status(200).json(savedRecord);
  } catch (error) {
    next(error);
  }
}

export async function chatWithErrorHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { context, messages } = req.body;
    if (!context || !messages || !Array.isArray(messages) || messages.length === 0) {
      throw AppError.badRequest('Context and at least one message are required.');
    }

    const aiProvider = getAIProvider();
    const reply = await aiProvider.chat(context, messages);

    res.status(200).json({ reply });
  } catch (error) {
    next(error);
  }
}

export async function getPublicAnalysisHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!id) {
      throw AppError.badRequest('Analysis ID is required.');
    }

    const record = HistoryRepository.getAnalysisById(id);
    if (!record) {
      throw AppError.notFound('Shared analysis not found or has been removed.');
    }

    res.status(200).json(record);
  } catch (error) {
    next(error);
  }
}

