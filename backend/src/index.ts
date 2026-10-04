import { createApp } from './app.js';
import { env } from './config/env.js';
import { runMigrations } from './database/migrations.js';
import { closeDatabase } from './database/connection.js';
import { initKeepAliveService } from './services/keepAlive.js';
import { logger } from './utils/logger.js';

async function startServer() {
  try {
    // Run database migrations on startup
    runMigrations();

    const app = createApp();

    const server = app.listen(env.APP_PORT, env.APP_HOST, () => {
      logger.info(`AI Error Explainer backend running at http://${env.APP_HOST}:${env.APP_PORT}`);
      logger.info(`Environment: ${env.APP_ENV} | Active AI Provider: ${env.AI_PROVIDER}`);
      
      // Initialize 14-minute keepalive service
      initKeepAliveService();
    });

    const gracefulShutdown = (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        closeDatabase();
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start backend server:', { error });
    process.exit(1);
  }
}

startServer();

