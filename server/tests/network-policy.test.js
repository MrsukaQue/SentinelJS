import { describe, expect, it } from 'vitest';
import { isBlockedAddress, normalizeUrl, resolvePublicTarget } from '../src/scanner/network-policy.js';

describe('URL and SSRF policy', () => {
  it.each(['127.0.0.1', '10.2.3.4', '172.20.1.1', '192.168.1.1', '169.254.169.254', '::1', 'fd00::1', 'fe80::1', '::ffff:127.0.0.1', '::ffff:7f00:1'])('blocks %s', (address) => expect(isBlockedAddress(address)).toBe(true));
  it.each(['https://localhost', 'file:///etc/passwd', 'http://user:pass@example.com', 'https://example.com:8443'])('rejects %s', (url) => expect(() => normalizeUrl(url)).toThrow());
  it('rejects a hostname if any resolved address is private', async () => {
    const resolver = async () => [{ address: '93.184.216.34', family: 4 }, { address: '127.0.0.1', family: 4 }];
    await expect(resolvePublicTarget(new URL('https://example.com'), resolver)).rejects.toMatchObject({ code: 'BLOCKED_ADDRESS' });
  });
});
