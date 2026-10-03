import { Router } from 'express';
import { analyzeErrorHandler, reanalyzeHandler } from '../handlers/analysis.js';

export const analysisRouter = Router();

analysisRouter.post('/analyze', analyzeErrorHandler);
analysisRouter.post('/analyses/:id/reanalyze', reanalyzeHandler);
