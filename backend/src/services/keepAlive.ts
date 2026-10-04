import { logger } from '../utils/logger.js';

let keepAliveInterval: NodeJS.Timeout | null = null;

/**
 * Initializes a 14-minute self-ping loop to keep free-tier services (e.g., Render) awake.
 * Render free web services go to sleep after 15 minutes of inactivity.
 */
export function initKeepAliveService(): void {
  const pingUrl = process.env.PING_URL || process.env.RENDER_EXTERNAL_URL;

  // Run self-ping every 14 minutes (840,000 ms)
  const INTERVAL_MS = 14 * 60 * 1000;

  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }

  logger.info(`[KeepAlive] Service initialized. Self-ping interval: 14 minutes.`);

  if (pingUrl) {
    logger.info(`[KeepAlive] Target URL set to: ${pingUrl}`);
  } else {
    logger.info(`[KeepAlive] No PING_URL or RENDER_EXTERNAL_URL specified. Defaulting to internal localhost ping.`);
  }

  keepAliveInterval = setInterval(async () => {
    try {
      const targetUrl = pingUrl ? `${pingUrl.replace(/\/$/, '')}/api/health` : `http://localhost:${process.env.APP_PORT || 3001}/api/health`;
      logger.info(`[KeepAlive] Executing 14-minute keep-alive ping to ${targetUrl}...`);

      const response = await fetch(targetUrl);
      if (response.ok) {
        logger.info(`[KeepAlive] Ping successful! Status: ${response.status}`);
      } else {
        logger.warn(`[KeepAlive] Ping received non-OK response: ${response.status}`);
      }
    } catch (err) {
      logger.error('KeepAlive ping failed:', { error: String(err) });
    }
  }, INTERVAL_MS);
}
