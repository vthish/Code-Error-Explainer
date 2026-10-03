import { Router } from 'express';
import { getAnalysesHandler, getAnalysisByIdHandler, deleteAnalysisHandler } from '../handlers/history.js';

export const historyRouter = Router();

historyRouter.get('/analyses', getAnalysesHandler);
historyRouter.get('/analyses/:id', getAnalysisByIdHandler);
historyRouter.delete('/analyses/:id', deleteAnalysisHandler);
