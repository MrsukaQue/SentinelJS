export const severityWeights = Object.freeze({
  CRITICAL: 25,
  HIGH: 12,
  MEDIUM: 6,
  LOW: 2,
  INFORMATIONAL: 0,
});

export function scoreFindings(findings) {
  const scored = findings.map((item) => ({ ...item, deduction: severityWeights[item.severity] }));
  const deduction = scored.reduce((total, item) => total + item.deduction, 0);
  return { score: Math.max(0, 100 - deduction), deduction, findings: scored };
}
