import { finding } from './finding.js';

const definitions = [
  {
    id: 'missing-csp',
    name: 'Content Security Policy is missing',
    header: 'content-security-policy',
    severity: 'HIGH',
    description: 'The response did not include a Content-Security-Policy header.',
    impact: 'A suitable CSP can reduce the impact of some client-side injection vulnerabilities.',
    recommendation: "Define a restrictive policy tailored to the site's required resources.",
    reference: 'https://owasp.org/www-project-secure-headers/#content-security-policy',
  },
  {
    id: 'missing-hsts',
    name: 'Strict Transport Security is missing',
    header: 'strict-transport-security',
    severity: 'MEDIUM',
    httpsOnly: true,
    description: 'The HTTPS response did not include Strict-Transport-Security.',
    impact: 'Browsers may permit an initial insecure connection before redirecting to HTTPS.',
    recommendation: 'Add HSTS after confirming all subdomains support HTTPS.',
    reference: 'https://owasp.org/www-project-secure-headers/#http-strict-transport-security-hsts',
  },
  {
    id: 'missing-nosniff',
    name: 'MIME sniffing protection is missing',
    header: 'x-content-type-options',
    severity: 'LOW',
    expected: 'nosniff',
    description: 'X-Content-Type-Options was absent or not set to nosniff.',
    impact: 'Some browsers could interpret content as a different MIME type.',
    recommendation: 'Set X-Content-Type-Options: nosniff.',
  },
  {
    id: 'missing-referrer-policy',
    name: 'Referrer Policy is missing',
    header: 'referrer-policy',
    severity: 'LOW',
    description: 'No explicit Referrer-Policy header was observed.',
    impact: 'URLs may disclose more referrer information than intended.',
    recommendation: 'Set a policy such as strict-origin-when-cross-origin.',
  },
  {
    id: 'missing-permissions-policy',
    name: 'Permissions Policy is missing',
    header: 'permissions-policy',
    severity: 'LOW',
    description: 'No Permissions-Policy header was observed.',
    impact: 'Browser capabilities are not explicitly constrained at the document boundary.',
    recommendation: 'Disable unneeded browser features with a narrow Permissions-Policy.',
  },
];

export const headerCheck = {
  id: 'security-headers',
  name: 'HTTP security headers',
  async run({ headers, finalUrl }) {
    const findings = definitions
      .filter((item) => !item.httpsOnly || finalUrl.protocol === 'https:')
      .filter(
        (item) =>
          !headers[item.header] ||
          (item.expected && headers[item.header].toLowerCase() !== item.expected),
      )
      .map((item) =>
        finding(
          { ...item, category: 'headers' },
          `${item.header} was ${headers[item.header] ? `set to “${headers[item.header]}”` : 'not present'}.`,
        ),
      );

    const csp = headers['content-security-policy'] || '';
    if (!headers['x-frame-options'] && !/(^|;)\s*frame-ancestors\s+/i.test(csp)) {
      findings.push(
        finding(
          {
            id: 'missing-frame-protection',
            name: 'Frame embedding protection is missing',
            category: 'headers',
            severity: 'MEDIUM',
            description:
              'Neither X-Frame-Options nor a CSP frame-ancestors directive was observed.',
            impact:
              'The page may be embeddable by another origin, increasing clickjacking exposure.',
            recommendation: "Set CSP frame-ancestors to the site's required embedding origins.",
            reference: 'https://owasp.org/www-community/attacks/Clickjacking',
          },
          'No response-level frame embedding restriction was observed.',
        ),
      );
    }
    return findings;
  },
};
