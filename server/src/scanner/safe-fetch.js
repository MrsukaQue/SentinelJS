import http from 'node:http';
import https from 'node:https';
import { config } from '../config.js';
import { AppError } from '../utils/errors.js';
import { normalizeUrl, resolvePublicTarget } from './network-policy.js';

function requestOnce(url, records) {
  const transport = url.protocol === 'https:' ? https : http;
  let selectedAddress;
  return new Promise((resolve, reject) => {
    const request = transport.request(url, {
      method: 'GET', headers: { 'User-Agent': `SentinelJS/${config.SCANNER_VERSION}`, Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.1' },
      timeout: config.SCAN_TIMEOUT_MS, rejectUnauthorized: true,
      lookup: (_hostname, options, callback) => {
        selectedAddress = records.find((item) => !options?.family || item.family === options.family) || records[0];
        callback(null, selectedAddress.address, selectedAddress.family);
      },
    }, (response) => {
      const chunks = [];
      let bytes = 0;
      response.on('data', (chunk) => {
        bytes += chunk.length;
        if (bytes > config.MAX_RESPONSE_BYTES) response.destroy(new AppError(413, 'RESPONSE_TOO_LARGE', 'Target response exceeded the scan size limit'));
        else chunks.push(chunk);
      });
      response.on('end', () => {
        const remoteAddress = response.socket.remoteAddress?.replace(/^::ffff:/, '');
        if (remoteAddress !== selectedAddress.address) return reject(new AppError(400, 'DNS_REBINDING', 'The connected address did not match validated DNS'));
        const certificate = response.socket.getPeerCertificate?.() || {};
        const rawHeaders = response.rawHeaders;
        const setCookies = [];
        for (let index = 0; index < rawHeaders.length; index += 2) if (rawHeaders[index].toLowerCase() === 'set-cookie') setCookies.push(rawHeaders[index + 1]);
        resolve({
          status: response.statusCode, headers: Object.fromEntries(Object.entries(response.headers).map(([key, value]) => [key, Array.isArray(value) ? value.join(', ') : String(value || '')])),
          setCookies, body: Buffer.concat(chunks).toString('utf8'),
          tls: certificate.valid_to ? { validTo: certificate.valid_to, issuer: certificate.issuer?.O, protocol: response.socket.getProtocol?.() } : null,
        });
      });
    });
    request.on('timeout', () => request.destroy(new AppError(504, 'TARGET_TIMEOUT', 'The target did not respond before the timeout')));
    request.on('error', reject);
    request.end();
  });
}

export async function safeFetch(input) {
  const requestedUrl = normalizeUrl(input);
  let currentUrl = requestedUrl;
  const redirectChain = [];
  for (let redirects = 0; redirects <= config.MAX_REDIRECTS; redirects += 1) {
    const records = await resolvePublicTarget(currentUrl);
    const response = await requestOnce(currentUrl, records);
    if (![301, 302, 303, 307, 308].includes(response.status) || !response.headers.location) return { ...response, requestedUrl, finalUrl: currentUrl, redirectChain };
    if (redirects === config.MAX_REDIRECTS) throw new AppError(400, 'TOO_MANY_REDIRECTS', 'Target exceeded the redirect limit');
    currentUrl = normalizeUrl(new URL(response.headers.location, currentUrl).href);
    redirectChain.push(currentUrl.href);
  }
  throw new AppError(500, 'REDIRECT_ERROR', 'Redirect processing failed');
}
