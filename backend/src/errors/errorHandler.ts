import { Request, Response, NextFunction } from 'express';
import { AppError } from './AppError.js';
import { logger } from '../utils/logger.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const requestId = req.headers['x-request-id'] as string;

  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error(`Non-operational error: ${err.message}`, { stack: err.stack }, requestId);
    } else {
      logger.warn(`Operational error: ${err.message}`, { code: err.code, statusCode: err.statusCode }, requestId);
    }

    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  // Unhandled standard Error
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack }, requestId);

  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred.',
    },
  });
}
