export function finding(check, evidence, overrides = {}) {
  return {
    checkId: check.id,
    name: check.name,
    category: check.category,
    severity: check.severity,
    description: check.description,
    impact: check.impact,
    recommendation: check.recommendation,
    component: overrides.component || 'HTTP response',
    reference: check.reference || null,
    evidence,
    ...overrides,
  };
}
