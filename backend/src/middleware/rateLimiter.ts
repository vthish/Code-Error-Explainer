import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../errors/AppError.js';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipHits = new Map<string, RateLimitRecord>();

// Cleanup stale records every minute
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipHits.entries()) {
    if (now > record.resetTime) {
      ipHits.delete(ip);
    }
  }
}, 60000);

export function rateLimiterMiddleware(req: Request, res: Response, next: NextFunction): void {
  const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();

  const record = ipHits.get(clientIp);

  if (!record || now > record.resetTime) {
    ipHits.set(clientIp, {
      count: 1,
      resetTime: now + env.RATE_LIMIT_WINDOW_MS,
    });
    return next();
  }

  if (record.count >= env.RATE_LIMIT_REQUESTS) {
    return next(AppError.rateLimitExceeded());
  }

  record.count += 1;
  next();
}
