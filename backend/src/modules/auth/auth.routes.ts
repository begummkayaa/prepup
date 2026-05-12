import { Prisma } from '@prisma/client';
import type { SignOptions } from 'jsonwebtoken';
import { Router } from 'express';

import { loadConfig } from '../../config.js';
import { getPrisma } from '../../db/prisma.js';
import { hashPassword, verifyPassword } from '../../lib/auth/password.js';
import { signAccessToken } from '../../lib/auth/tokens.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

function publicUser(u: { id: string; email: string; fullName: string }) {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
  };
}

router.post('/register', async (req, res) => {
  const prisma = getPrisma();
  if (!prisma) {
    res.status(503).json({ error: 'Sunucuda veritabanı yapılandırılmadı.' });
    return;
  }

  const body = req.body as Record<string, unknown>;
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
  const emailRaw = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!fullName) {
    res.status(400).json({ error: 'Tam isim gerekli.' });
    return;
  }
  if (!emailRaw.includes('@')) {
    res.status(400).json({ error: 'Geçerli bir e-posta gir.' });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'Şifre en az 8 karakter olmalı.' });
    return;
  }

  const passwordHash = await hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: {
        email: emailRaw,
        passwordHash,
        fullName,
      },
    });
    const cfg = loadConfig();
    const accessToken = signAccessToken(
      { sub: user.id, email: user.email },
      cfg.jwtSecret,
      cfg.jwtExpiresIn as SignOptions['expiresIn']
    );
    res.status(201).json({ accessToken, user: publicUser(user) });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      res.status(409).json({ error: 'Bu e-posta ile zaten kayıt var.' });
      return;
    }
    throw e;
  }
});

router.post('/login', async (req, res) => {
  const prisma = getPrisma();
  if (!prisma) {
    res.status(503).json({ error: 'Sunucuda veritabanı yapılandırılmadı.' });
    return;
  }

  const body = req.body as Record<string, unknown>;
  const emailRaw = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!emailRaw.includes('@')) {
    res.status(400).json({ error: 'Geçerli bir e-posta gir.' });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'Şifre en az 8 karakter olmalı.' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: emailRaw } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    res.status(401).json({ error: 'E-posta veya şifre hatalı.' });
    return;
  }

  const cfg = loadConfig();
  const accessToken = signAccessToken(
    { sub: user.id, email: user.email },
    cfg.jwtSecret,
    cfg.jwtExpiresIn as SignOptions['expiresIn']
  );
  res.json({ accessToken, user: publicUser(user) });
});

router.get('/me', requireAuth, async (req, res) => {
  const prisma = getPrisma();
  if (!prisma) {
    res.status(503).json({ error: 'Sunucuda veritabanı yapılandırılmadı.' });
    return;
  }

  const id = req.authUserId;
  if (!id) {
    res.status(401).json({ error: 'Oturum gerekli.' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    res.status(401).json({ error: 'Hesap bulunamadı.' });
    return;
  }

  res.json({ user: publicUser(user) });
});

export { router as authRouter };
