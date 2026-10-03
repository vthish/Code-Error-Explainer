import { Router } from 'express';
import { healthRouter } from './health.js';
import { analysisRouter } from './analysis.js';
import { historyRouter } from './history.js';

export const apiRouter = Router();

apiRouter.use('/', healthRouter);
apiRouter.use('/', analysisRouter);
apiRouter.use('/', historyRouter);
