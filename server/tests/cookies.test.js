import { describe, expect, it } from 'vitest';
import { cookieCheck, parseSetCookie } from '../src/scanner/checks/cookies.js';

describe('cookie checks', () => {
  it('parses attributes without retaining cookie values', () => {
    expect(parseSetCookie('session=secret; Secure; HttpOnly; SameSite=Lax')).toEqual({
      name: 'session',
      attributes: { secure: true, httponly: true, samesite: 'Lax' },
    });
  });
  it('reports missing controls', async () => {
    const results = await cookieCheck.run({
      setCookies: ['session=secret'],
      finalUrl: new URL('https://example.com'),
    });
    expect(results.map((item) => item.checkId)).toEqual([
      'cookie-missing-secure',
      'cookie-missing-httponly',
      'cookie-missing-samesite',
    ]);
  });
});
