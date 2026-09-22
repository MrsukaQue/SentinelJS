import { sessionToken, verifyAccessToken } from '../services/auth-service.js';
import { AppError } from '../utils/errors.js';

export function requireAuth(req, _res, next) {
  const token = sessionToken(req.cookies);
  if (!token) return next(new AppError(401, 'AUTH_REQUIRED', 'Authentication is required'));
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch {
    return next(new AppError(401, 'INVALID_SESSION', 'The session is invalid or expired'));
  }
}
