import { describe, expect, it } from 'vitest';
import { headerCheck } from '../src/scanner/checks/headers.js';

describe('header checks', () => {
  it('does not report present baseline controls', async () => {
    const results = await headerCheck.run({ finalUrl: new URL('https://example.com'), headers: {
      'content-security-policy': "default-src 'self'; frame-ancestors 'none'", 'strict-transport-security': 'max-age=31536000',
      'x-content-type-options': 'nosniff', 'referrer-policy': 'strict-origin', 'permissions-policy': 'camera=()',
    }});
    expect(results).toEqual([]);
  });
});
