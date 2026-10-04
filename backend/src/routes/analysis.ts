import { Router } from 'express';
import { analyzeErrorHandler, reanalyzeHandler, chatWithErrorHandler, getPublicAnalysisHandler } from '../handlers/analysis.js';

export const analysisRouter = Router();

analysisRouter.post('/analyze', analyzeErrorHandler);
analysisRouter.post('/analyses/chat', chatWithErrorHandler);
analysisRouter.get('/analyses/public/:id', getPublicAnalysisHandler);
analysisRouter.post('/analyses/:id/reanalyze', reanalyzeHandler);
