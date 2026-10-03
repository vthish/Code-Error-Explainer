import { Request, Response, NextFunction } from 'express';
import { HistoryRepository } from '../services/history/repository.js';
import { AppError } from '../errors/AppError.js';

export function getAnalysesHandler(req: Request, res: Response, next: NextFunction): void {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const offset = Math.max(Number(req.query.offset) || 0, 0);

    const analyses = HistoryRepository.getAnalyses(limit, offset);
    res.status(200).json({
      data: analyses,
      pagination: {
        limit,
        offset,
        count: analyses.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

export function getAnalysisByIdHandler(req: Request, res: Response, next: NextFunction): void {
  try {
    const { id } = req.params;
    if (!id) {
      throw AppError.badRequest('Analysis ID is required.');
    }

    const record = HistoryRepository.getAnalysisById(id);
    if (!record) {
      throw AppError.notFound(`Analysis with ID ${id} was not found.`);
    }

    res.status(200).json(record);
  } catch (error) {
    next(error);
  }
}

export function deleteAnalysisHandler(req: Request, res: Response, next: NextFunction): void {
  try {
    const { id } = req.params;
    if (!id) {
      throw AppError.badRequest('Analysis ID is required.');
    }

    const deleted = HistoryRepository.deleteAnalysis(id);
    if (!deleted) {
      throw AppError.notFound(`Analysis with ID ${id} was not found.`);
    }

    res.status(200).json({
      message: 'Analysis record successfully deleted.',
      id,
    });
  } catch (error) {
    next(error);
  }
}
