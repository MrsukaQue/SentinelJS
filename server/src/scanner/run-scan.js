import { checks } from './checks/index.js';
import { ScannerEngine } from './engine.js';
import { safeFetch } from './safe-fetch.js';
import { scoreFindings } from './scoring/index.js';

const engine = new ScannerEngine({ checks, fetchTarget: safeFetch });

export async function runScan(url, onProgress) {
  const result = await engine.scan(url, onProgress);
  return scoreFindings(result.findings);
}
