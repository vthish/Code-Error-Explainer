import express, { Express } from 'express';
import { requestIdMiddleware } from './middleware/requestId.js';
import { corsMiddleware } from './middleware/cors.js';
import { rateLimiterMiddleware } from './middleware/rateLimiter.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './errors/errorHandler.js';
import { AppError } from './errors/AppError.js';

export function createApp(): Express {
  const app = express();

  // Basic security and parsing middleware
  app.use(requestIdMiddleware);
  app.use(corsMiddleware);
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(rateLimiterMiddleware);

  // Mount API routes
  app.use('/api', apiRouter);

  // 404 Handler for unmatched routes
  app.use((req, res, next) => {
    next(AppError.notFound(`Endpoint ${req.method} ${req.originalUrl} not found.`));
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
