import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { requireAuth } from '../src/middleware/auth.js';
import { signAccessToken } from '../src/services/auth-service.js';
import { errorHandler } from '../src/middleware/error-handler.js';

describe('authentication middleware', () => {
  const app = express()
    .use(cookieParser())
    .get('/private', requireAuth, (req, res) => res.json(req.user))
    .use(errorHandler);
  it('rejects missing sessions', async () =>
    expect((await request(app).get('/private')).status).toBe(401));
  it('accepts a valid signed session', async () => {
    const token = signAccessToken({ id: 'user-id', email: 'owner@example.com' });
    const response = await request(app).get('/private').set('Cookie', `sentinel_session=${token}`);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe('user-id');
  });
});
