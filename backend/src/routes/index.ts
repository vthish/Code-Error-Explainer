import { Router } from 'express';
import { healthRouter } from './health.js';
import { analysisRouter } from './analysis.js';
import { historyRouter } from './history.js';
import { authRouter } from './auth.js';
import { optionalAuth } from '../middleware/auth.js';

export const apiRouter = Router();

apiRouter.use('/', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/', optionalAuth, analysisRouter);
apiRouter.use('/', optionalAuth, historyRouter);

