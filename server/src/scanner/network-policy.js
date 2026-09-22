import dns from 'node:dns/promises';
import net from 'node:net';
import { AppError } from '../utils/errors.js';

const blockedHostnames = new Set([
  'localhost',
  'localhost.localdomain',
  'metadata.google.internal',
  'metadata.azure.internal',
  'instance-data.ec2.internal',
]);

function ipv4Number(address) {
  return address.split('.').reduce((value, octet) => value * 256 + Number(octet), 0) >>> 0;
}

function inV4Range(address, base, bits) {
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return (ipv4Number(address) & mask) === (ipv4Number(base) & mask);
}

export function isBlockedAddress(address) {
  if (net.isIPv4(address)) {
    return [
      ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8],
      ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24],
      ['192.168.0.0', 16], ['198.18.0.0', 15], ['198.51.100.0', 24], ['203.0.113.0', 24],
      ['224.0.0.0', 4], ['240.0.0.0', 4],
    ].some(([base, bits]) => inV4Range(address, base, bits));
  }
  if (net.isIPv6(address)) {
    const normalized = address.toLowerCase().split('%')[0];
    if (normalized === '::' || normalized === '::1') return true;
    const mapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isBlockedAddress(mapped[1]);
    return /^(f[cd]|fe[89ab])/.test(normalized) || normalized.startsWith('2001:db8:');
  }
  return true;
}

export function normalizeUrl(input) {
  let url;
  try { url = new URL(input); } catch { throw new AppError(400, 'INVALID_URL', 'Enter a valid absolute URL'); }
  if (!['http:', 'https:'].includes(url.protocol)) throw new AppError(400, 'UNSUPPORTED_PROTOCOL', 'Only HTTP and HTTPS URLs are allowed');
  if (url.username || url.password) throw new AppError(400, 'URL_CREDENTIALS', 'URLs containing credentials are not allowed');
  if (url.port && !['80', '443'].includes(url.port)) throw new AppError(400, 'UNSUPPORTED_PORT', 'Only standard HTTP and HTTPS ports are allowed');
  url.hash = '';
  url.hostname = url.hostname.toLowerCase().replace(/\.$/, '');
  if (!url.hostname || blockedHostnames.has(url.hostname) || url.hostname.endsWith('.localhost')) throw new AppError(400, 'BLOCKED_HOST', 'The target hostname is not allowed');
  return url;
}

export async function resolvePublicTarget(url, resolver = dns.lookup) {
  let records;
  try { records = await resolver(url.hostname, { all: true, verbatim: true }); } catch { throw new AppError(400, 'DNS_FAILED', 'The target hostname could not be resolved'); }
  if (!records.length || records.some(({ address }) => isBlockedAddress(address))) throw new AppError(400, 'BLOCKED_ADDRESS', 'The target resolves to a private, reserved, or local address');
  return records;
}
