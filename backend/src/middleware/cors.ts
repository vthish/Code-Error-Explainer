import cors from 'cors';
import { env } from '../config/env.js';

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, cURL, server-to-server) or matching origin
    if (!origin || origin === env.FRONTEND_ORIGIN || env.APP_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('CORS request rejected: Origin not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
});
