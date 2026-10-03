type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogPayload {
  level: LogLevel;
  message: string;
  timestamp: string;
  requestId?: string;
  meta?: Record<string, unknown>;
}

export const logger = {
  log(level: LogLevel, message: string, meta?: Record<string, unknown>, requestId?: string) {
    const payload: LogPayload = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(requestId && { requestId }),
      ...(meta && { meta }),
    };

    const formatted = JSON.stringify(payload);
    if (level === 'error') {
      console.error(formatted);
    } else if (level === 'warn') {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  },

  info(message: string, meta?: Record<string, unknown>, requestId?: string) {
    this.log('info', message, meta, requestId);
  },

  warn(message: string, meta?: Record<string, unknown>, requestId?: string) {
    this.log('warn', message, meta, requestId);
  },

  error(message: string, meta?: Record<string, unknown>, requestId?: string) {
    this.log('error', message, meta, requestId);
  },

  debug(message: string, meta?: Record<string, unknown>, requestId?: string) {
    this.log('debug', message, meta, requestId);
  },
};
