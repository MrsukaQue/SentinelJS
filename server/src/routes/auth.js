import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { loginUser, logoutUser, registerUser } from '../controllers/auth-controller.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/errors.js';

const credentials = z.object({ body: z.object({ email: z.email().max(254), password: z.string().min(12).max(128) }), params: z.object({}), query: z.object({}) });
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: { code: 'RATE_LIMITED', message: 'Too many authentication attempts' } } });

export const authRouter = Router();
authRouter.post('/register', limiter, validate(credentials), asyncHandler(registerUser));
authRouter.post('/login', limiter, validate(credentials), asyncHandler(loginUser));
authRouter.post('/logout', logoutUser);
