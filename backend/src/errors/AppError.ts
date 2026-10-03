export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, code = 'INVALID_REQUEST'): AppError {
    return new AppError(message, 400, code);
  }

  static notFound(message = 'Resource not found'): AppError {
    return new AppError(message, 404, 'NOT_FOUND');
  }

  static rateLimitExceeded(message = 'Rate limit exceeded. Please try again later.'): AppError {
    return new AppError(message, 429, 'RATE_LIMIT_EXCEEDED');
  }

  static aiProviderError(message: string): AppError {
    return new AppError(message, 502, 'AI_PROVIDER_ERROR');
  }

  static internal(message = 'Internal server error'): AppError {
    return new AppError(message, 500, 'INTERNAL_SERVER_ERROR', false);
  }
}
