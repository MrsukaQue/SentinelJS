import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { db } from '../database/client.js';
import { AppError } from '../utils/errors.js';

const cookieName = 'sentinel_session';
const cookieOptions = {
  httpOnly: true,
  secure: config.COOKIE_SECURE,
  sameSite: 'strict',
  path: '/',
  maxAge: 8 * 60 * 60 * 1000,
};

export async function register(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await db.user.findUnique({ where: { email: normalizedEmail }, select: { id: true } });
  if (existing) throw new AppError(409, 'EMAIL_EXISTS', 'An account with this email already exists');
  const user = await db.user.create({ data: { email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12) }, select: { id: true, email: true, createdAt: true } });
  return user;
}

export async function authenticate(email, password) {
  const user = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
  return { id: user.id, email: user.email };
}

export function signAccessToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, config.JWT_SECRET, { expiresIn: '8h', issuer: 'sentineljs', audience: 'sentineljs-web' });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, config.JWT_SECRET, { issuer: 'sentineljs', audience: 'sentineljs-web' });
}

export function setSessionCookie(res, token) { res.cookie(cookieName, token, cookieOptions); }
export function clearSessionCookie(res) { res.clearCookie(cookieName, { ...cookieOptions, maxAge: undefined }); }
export function sessionToken(cookies) { return cookies?.[cookieName]; }
