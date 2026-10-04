import cors from 'cors';
import { env } from '../config/env.js';

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow non-browser requests, localhost, onrender.com domains, or production API access
    if (
      !origin ||
      origin === env.FRONTEND_ORIGIN ||
      origin.endsWith('.onrender.com') ||
      env.APP_ENV === 'development' ||
      env.APP_ENV === 'production'
    ) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
});

