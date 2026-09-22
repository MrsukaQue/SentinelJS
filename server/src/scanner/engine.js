export class ScannerEngine {
  constructor({ checks, fetchTarget }) {
    this.checks = checks;
    this.fetchTarget = fetchTarget;
  }

  async scan(url, onProgress = () => {}) {
    await onProgress('CONNECTING', 10);
    const response = await this.fetchTarget(url);
    const findings = [];
    await onProgress('SCANNING', 25);
    for (const [index, check] of this.checks.entries()) {
      const result = await check.run(response);
      findings.push(...result);
      await onProgress('SCANNING', 25 + Math.round(((index + 1) / this.checks.length) * 60));
    }
    await onProgress('ANALYZING', 90);
    return { response, findings };
  }
}
