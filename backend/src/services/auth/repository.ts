import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../../database/connection.js';

export interface UserRecord {
  id: string;
  google_id: string | null;
  email: string;
  name: string;
  picture: string | null;
  created_at: string;
}

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  picture?: string | null;
}

const JWT_SECRET = process.env.JWT_SECRET || 'code_error_explainer_default_secret_key_2026';

export class AuthRepository {
  static upsertGoogleUser(googleId: string, email: string, name: string, picture?: string): UserRecord {
    const db = getDatabase();
    const existing = db.prepare('SELECT * FROM users WHERE google_id = ? OR email = ?').get(googleId, email) as UserRecord | undefined;

    if (existing) {
      db.prepare(`
        UPDATE users
        SET name = ?, picture = COALESCE(?, picture)
        WHERE id = ?
      `).run(name, picture || null, existing.id);

      return {
        ...existing,
        name,
        picture: picture || existing.picture,
      };
    }

    const id = `user_${uuidv4()}`;
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, google_id, email, name, picture, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, googleId, email, name, picture || null, createdAt);

    return {
      id,
      google_id: googleId,
      email,
      name,
      picture: picture || null,
      created_at: createdAt,
    };
  }

  static findById(id: string): UserRecord | null {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRecord | undefined;
    return row || null;
  }

  // Lightweight JWT Token Generator (Pure Node.js crypto)
  static generateToken(user: { id: string; email: string; name: string; picture?: string | null }): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
    })).toString('base64url');

    const signature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    return `${header}.${payload}.${signature}`;
  }

  // Verify JWT Token
  static verifyToken(token: string): UserDTO | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [header, payload, signature] = parts;
      const expectedSignature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${header}.${payload}`)
        .digest('base64url');

      if (signature !== expectedSignature) return null;

      const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
      if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
        return null; // Expired
      }

      return {
        id: decodedPayload.sub,
        email: decodedPayload.email,
        name: decodedPayload.name,
        picture: decodedPayload.picture,
      };
    } catch {
      return null;
    }
  }
}
