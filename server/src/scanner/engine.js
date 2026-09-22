export class ScannerEngine {
  constructor({ checks, fetchTarget }) {
    this.checks = checks;
    this.fetchTarget = fetchTarget;
  }

  async scan(url, onProgress = () => {}) {
    onProgress('CONNECTING', 10);
    const response = await this.fetchTarget(url);
    const findings = [];
    onProgress('SCANNING', 25);
    for (const [index, check] of this.checks.entries()) {
      const result = await check.run(response);
      findings.push(...result);
      onProgress('SCANNING', 25 + Math.round(((index + 1) / this.checks.length) * 60));
    }
    onProgress('ANALYZING', 90);
    return { response, findings };
  }
}
