import { describe, expect, it } from 'vitest';
import { contentCheck } from '../src/scanner/checks/content.js';
import { corsCheck } from '../src/scanner/checks/cors.js';
import { transportCheck } from '../src/scanner/checks/transport.js';

describe('passive scanner modules', () => {
  it('detects mixed resources and insecure form destinations', async () => {
    const findings = await contentCheck.run({
      finalUrl: new URL('https://example.com'),
      body: '<img src="http://cdn.example.test/a.png"><form action="http://example.test/submit"></form>',
    });
    expect(findings.map((item) => item.checkId)).toEqual(['mixed-content', 'insecure-form-action']);
  });

  it('does not report ordinary restrictive CORS', async () => {
    expect(
      await corsCheck.run({
        headers: {
          'access-control-allow-origin': 'https://trusted.example',
          'access-control-allow-credentials': 'true',
        },
      }),
    ).toEqual([]);
  });

  it('records validated TLS information without a score deduction', async () => {
    const findings = await transportCheck.run({
      requestedUrl: new URL('https://example.com'),
      finalUrl: new URL('https://example.com'),
      tls: {
        validTo: new Date(Date.now() + 90 * 86400000).toISOString(),
        protocol: 'TLSv1.3',
        issuer: 'Test CA',
      },
    });
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      checkId: 'tls-observation',
      severity: 'INFORMATIONAL',
    });
  });
});
