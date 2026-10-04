import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AuthRepository } from '../services/auth/repository.js';
import { AppError } from '../errors/AppError.js';

export function googleAuthHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const { credential, email, name, picture, googleId } = req.body;

    let userEmail = email;
    let userName = name;
    let userPicture = picture;
    let gId = googleId;

    // If standard Google ID token credential payload passed
    if (credential && typeof credential === 'string') {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
          userEmail = payload.email || userEmail;
          userName = payload.name || payload.email?.split('@')[0] || 'Google User';
          userPicture = payload.picture || userPicture;
          gId = payload.sub || gId;
        }
      } catch {
        // Fallback to direct parameters if decoding fails
      }
    }

    if (!userEmail) {
      throw AppError.badRequest('Valid Google email address is required.');
    }

    gId = gId || `gid_${Buffer.from(userEmail).toString('hex').slice(0, 12)}`;
    userName = userName || userEmail.split('@')[0];

    const user = AuthRepository.upsertGoogleUser(gId, userEmail, userName, userPicture);
    const token = AuthRepository.generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    });

    res.status(200).json({
      message: 'Successfully authenticated with Google',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    });
  } catch (error) {
    next(error);
  }
}

export function demoAuthHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const demoEmail = req.body.email || 'developer@codeexplainer.ai';
    const demoName = req.body.name || 'Demo Developer';
    const demoPicture = 'https://api.dicebear.com/7.x/bottts/svg?seed=DemoUser';

    const user = AuthRepository.upsertGoogleUser(`demo_${demoEmail}`, demoEmail, demoName, demoPicture);
    const token = AuthRepository.generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    });

    res.status(200).json({
      message: 'Logged in as Demo Developer',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    });
  } catch (error) {
    next(error);
  }
}

export function getMeHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Not authenticated');
    }

    const user = AuthRepository.findById(req.user.id);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
}
