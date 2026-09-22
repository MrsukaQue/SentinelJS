import { finding } from './finding.js';

const base = {
  category: 'cookies',
  component: 'Set-Cookie response header',
  reference: 'https://owasp.org/www-community/controls/SecureCookieAttribute',
};

export function parseSetCookie(value) {
  const [pair, ...attributes] = value.split(';').map((part) => part.trim());
  const separator = pair.indexOf('=');
  return {
    name: separator > 0 ? pair.slice(0, separator) : '(invalid)',
    attributes: Object.fromEntries(attributes.map((attribute) => {
      const [key, ...rest] = attribute.split('=');
      return [key.toLowerCase(), rest.join('=') || true];
    })),
  };
}

export const cookieCheck = {
  id: 'cookie-security', name: 'Cookie security attributes',
  async run({ setCookies = [], finalUrl }) {
    return setCookies.flatMap((raw) => {
      const cookie = parseSetCookie(raw);
      const output = [];
      if (finalUrl.protocol === 'https:' && !cookie.attributes.secure) output.push(finding({ ...base, id: 'cookie-missing-secure', name: 'Cookie missing Secure flag', severity: 'HIGH', description: 'A cookie issued over HTTPS did not include Secure.', impact: 'The browser may send the cookie over an unencrypted connection.', recommendation: 'Add Secure to cookies issued by HTTPS applications.' }, `Cookie “${cookie.name}” did not include Secure.`));
      if (!cookie.attributes.httponly) output.push(finding({ ...base, id: 'cookie-missing-httponly', name: 'Cookie missing HttpOnly flag', severity: 'MEDIUM', description: 'A cookie did not include HttpOnly.', impact: 'Client-side scripts can read the cookie if script execution occurs.', recommendation: 'Add HttpOnly to cookies that do not need JavaScript access.' }, `Cookie “${cookie.name}” did not include HttpOnly.`));
      if (!cookie.attributes.samesite) output.push(finding({ ...base, id: 'cookie-missing-samesite', name: 'Cookie missing SameSite attribute', severity: 'LOW', description: 'A cookie did not explicitly define SameSite.', impact: 'Cross-site cookie behavior relies on browser defaults.', recommendation: 'Set SameSite=Lax or Strict unless cross-site use is required.' }, `Cookie “${cookie.name}” did not include SameSite.`));
      if (String(cookie.attributes.samesite).toLowerCase() === 'none' && !cookie.attributes.secure) output.push(finding({ ...base, id: 'cookie-samesite-none-insecure', name: 'SameSite=None cookie is not Secure', severity: 'MEDIUM', description: 'SameSite=None was used without Secure.', impact: 'The configuration is rejected by modern browsers and can expose legacy clients.', recommendation: 'Pair SameSite=None with Secure.' }, `Cookie “${cookie.name}” used SameSite=None without Secure.`));
      return output;
    });
  },
};
