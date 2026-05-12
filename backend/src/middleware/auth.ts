import type { RequestHandler } from 'express';
import type { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import { loadConfig } from '../config.js';

declare module 'express-serve-static-core' {
  interface Request {
    authUserId?: string;
  }
}

function sendUnauthorized(res: import('express').Response, message: string) {
  res.status(401).json({ error: message });
}

/** Authorization: Bearer token; `req.authUserId` atanır */
export const requireAuth: RequestHandler = (req, res, next) => {
  const raw = req.headers.authorization;
  if (!raw || typeof raw !== 'string') {
    sendUnauthorized(res, 'Oturum gerekli.');
    return;
  }
  const token = raw.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    sendUnauthorized(res, 'Oturum gerekli.');
    return;
  }
  try {
    const cfg = loadConfig();
    const decoded = jwt.verify(token, cfg.jwtSecret) as JwtPayload;
    const sub = typeof decoded.sub === 'string' ? decoded.sub : '';
    if (!sub) {
      sendUnauthorized(res, 'Geçersiz oturum.');
      return;
    }
    req.authUserId = sub;
    next();
  } catch {
    sendUnauthorized(res, 'Geçersiz veya süresi dolmuş oturum.');
  }
};
