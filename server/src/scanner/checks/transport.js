import { finding } from './finding.js';

export const transportCheck = {
  id: 'https-transport',
  name: 'HTTPS transport',
  async run({ requestedUrl, finalUrl, tls }) {
    const output = [];
    if (finalUrl.protocol !== 'https:')
      output.push(
        finding(
          {
            id: 'https-unavailable',
            name: 'Connection is not protected by HTTPS',
            category: 'transport',
            severity: 'HIGH',
            description: 'The final response was delivered over HTTP.',
            impact: 'Network observers can read or modify traffic.',
            recommendation: 'Deploy a valid TLS certificate and redirect HTTP requests to HTTPS.',
            reference:
              'https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/09-Testing_for_Weak_Cryptography/01-Testing_for_Weak_Transport_Layer_Security',
          },
          `Final URL used ${finalUrl.protocol}`,
        ),
      );
    if (requestedUrl.protocol === 'http:' && finalUrl.protocol === 'http:')
      output.push(
        finding(
          {
            id: 'no-http-redirect',
            name: 'HTTP does not redirect to HTTPS',
            category: 'transport',
            severity: 'MEDIUM',
            description: 'The requested HTTP URL did not upgrade to HTTPS.',
            impact: 'Visitors can remain on an unencrypted connection.',
            recommendation: 'Redirect all HTTP traffic to the equivalent HTTPS URL.',
          },
          'The redirect chain ended on HTTP.',
        ),
      );
    if (tls?.validTo) {
      const days = Math.floor((new Date(tls.validTo) - Date.now()) / 86400000);
      if (days < 30)
        output.push(
          finding(
            {
              id: 'certificate-expiring',
              name: 'TLS certificate expires soon',
              category: 'transport',
              severity: days < 0 ? 'HIGH' : 'MEDIUM',
              description: 'The observed certificate is expired or close to expiration.',
              impact: 'Visitors may receive certificate warnings or lose secure connectivity.',
              recommendation: 'Renew and deploy the certificate before expiration.',
            },
            `Certificate validity remaining: ${days} day(s).`,
          ),
        );
      output.push(
        finding(
          {
            id: 'tls-observation',
            name: 'TLS connection information',
            category: 'transport',
            severity: 'INFORMATIONAL',
            description: 'Basic information from the validated TLS connection.',
            impact:
              'This is contextual information and does not establish that the full TLS configuration is secure.',
            recommendation:
              'Review the complete TLS configuration with an authorized specialist tool when deeper assurance is required.',
          },
          `Protocol: ${tls.protocol || 'unknown'}; certificate expires: ${tls.validTo}; issuer: ${tls.issuer || 'not provided'}.`,
          { component: 'TLS connection' },
        ),
      );
    }
    return output;
  },
};
