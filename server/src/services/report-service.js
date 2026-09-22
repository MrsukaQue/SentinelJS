function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character],
  );
}

export function reportData(scan) {
  const counts = Object.fromEntries(
    ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL'].map((severity) => [
      severity,
      scan.findings.filter((item) => item.severity === severity).length,
    ]),
  );
  return {
    reportVersion: 1,
    scannerVersion: scan.scannerVersion,
    target: scan.target.url,
    scannedAt: scan.completedAt,
    score: scan.score,
    summary: {
      totalFindings: scan.findings.length,
      bySeverity: counts,
      notice:
        'This score reflects limited passive checks and does not prove that the target is secure or vulnerable.',
    },
    findings: scan.findings.map(
      ({
        checkId,
        name,
        severity,
        category,
        evidence,
        description,
        impact,
        component,
        recommendation,
        reference,
        deduction,
      }) => ({
        checkId,
        name,
        severity,
        category,
        evidence,
        description,
        impact,
        component,
        recommendation,
        reference,
        deduction,
      }),
    ),
  };
}

export function htmlReport(scan) {
  const report = reportData(scan);
  const findings = report.findings
    .map(
      (item) =>
        `<article><span class="severity ${item.severity.toLowerCase()}">${escapeHtml(item.severity)}</span><h2>${escapeHtml(item.name)}</h2><dl><dt>Evidence</dt><dd>${escapeHtml(item.evidence)}</dd><dt>Impact</dt><dd>${escapeHtml(item.impact)}</dd><dt>Affected component</dt><dd>${escapeHtml(item.component)}</dd><dt>Recommendation</dt><dd>${escapeHtml(item.recommendation)}</dd>${item.reference ? `<dt>Reference</dt><dd><a href="${escapeHtml(item.reference)}">${escapeHtml(item.reference)}</a></dd>` : ''}</dl></article>`,
    )
    .join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>SentinelJS report — ${escapeHtml(scan.target.hostname)}</title><style>body{font:15px system-ui;background:#07101b;color:#e8f0f8;max-width:900px;margin:40px auto;padding:0 20px}header,article{background:#101c2a;border:1px solid #23344a;border-radius:14px;padding:24px;margin-bottom:18px}h1{margin-top:0;color:#40e0aa}.score{font-size:42px;font-weight:700}.severity{font-size:11px;font-weight:800;letter-spacing:.08em}.critical,.high{color:#ff7887}.medium{color:#f2c45f}.low{color:#65bfff}.informational{color:#a9b8ca}dt{font-weight:700;color:#a9b8ca;margin-top:12px}dd{margin:4px 0}a{color:#65bfff;overflow-wrap:anywhere}.notice{color:#a9b8ca}</style></head><body><header><p>SentinelJS passive security audit</p><h1>${escapeHtml(report.target)}</h1><div class="score">${report.score} / 100</div><p>${escapeHtml(new Date(report.scannedAt).toISOString())}</p><p class="notice">${escapeHtml(report.summary.notice)}</p></header>${findings || '<article><h2>No findings from enabled checks</h2><p>This does not establish that the target is secure.</p></article>'}</body></html>`;
}
