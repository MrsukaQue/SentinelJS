import { describe, expect, it } from 'vitest';
import { scoreFindings } from '../src/scanner/scoring/index.js';

describe('scoring', () => {
  it('deducts documented weights and never drops below zero', () => {
    expect(scoreFindings([{ severity: 'HIGH' }, { severity: 'MEDIUM' }]).score).toBe(82);
    expect(scoreFindings(Array.from({ length: 5 }, () => ({ severity: 'CRITICAL' }))).score).toBe(
      0,
    );
  });
});
