import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  JWT_SECRET: z.string().min(32),
  COOKIE_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  SCANNER_VERSION: z.string().default('1.0.0'),
  SCAN_TIMEOUT_MS: z.coerce.number().int().min(1000).max(30000).default(10000),
  MAX_RESPONSE_BYTES: z.coerce.number().int().min(1024).max(5242880).default(2097152),
  MAX_REDIRECTS: z.coerce.number().int().min(0).max(10).default(5),
});

export const config = schema.parse(process.env);
