import { Router } from 'express';
import { googleAuthHandler, demoAuthHandler, getMeHandler } from '../handlers/auth.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/google', googleAuthHandler);
authRouter.post('/demo', demoAuthHandler);
authRouter.get('/me', requireAuth, getMeHandler);
