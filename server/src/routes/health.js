import { Router } from 'express';

export const healthRouter = Router().get('/', (_req, res) => {
  res.json({ data: { status: 'ok', service: 'sentineljs-api' } });
});
