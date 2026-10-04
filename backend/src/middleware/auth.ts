import { Request, Response, NextFunction } from 'express';
import { AuthRepository, UserDTO } from '../services/auth/repository.js';

export interface AuthenticatedRequest extends Request {
  user?: UserDTO;
}

export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7).trim();
  if (!token) return next();

  const user = AuthRepository.verifyToken(token);
  if (user) {
    req.user = user;
  }
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  optionalAuth(req, res, () => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized. Please sign in.' });
      return;
    }
    next();
  });
}
