import { Router, Request, Response } from 'express';
import { env } from '../config/env.js';
import { getDatabase } from '../database/connection.js';

export const healthRouter = Router();

healthRouter.get('/health', (req: Request, res: Response) => {
  let dbStatus = 'ok';

  try {
    const db = getDatabase();
    db.prepare('SELECT 1').get();
  } catch (error) {
    dbStatus = 'unhealthy';
  }

  const isHealthy = dbStatus === 'ok';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    version: '1.0.0',
    environment: env.APP_ENV,
    ai_provider: env.AI_PROVIDER,
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
    },
  });
});

healthRouter.get('/ping', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

