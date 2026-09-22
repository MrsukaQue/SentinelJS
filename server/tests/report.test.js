import { describe, expect, it } from 'vitest';
import { htmlReport, reportData } from '../src/services/report-service.js';

const scan = {
  scannerVersion: '1.0.0',
  completedAt: new Date('2026-01-01T00:00:00Z'),
  score: 88,
  target: { url: 'https://example.com/', hostname: 'example.com' },
  findings: [
    {
      checkId: 'x',
      name: '<script>alert(1)</script>',
      severity: 'HIGH',
      category: 'headers',
      evidence: 'missing',
      description: 'description',
      impact: 'impact',
      component: 'response',
      recommendation: 'fix',
      reference: null,
      deduction: 12,
    },
  ],
};

describe('reports', () => {
  it('provides reproducible score information', () =>
    expect(reportData(scan).findings[0].deduction).toBe(12));
  it('escapes finding text in HTML', () => {
    const html = htmlReport(scan);
    expect(html).not.toContain('<script>alert');
    expect(html).toContain('&lt;script&gt;');
  });
});
