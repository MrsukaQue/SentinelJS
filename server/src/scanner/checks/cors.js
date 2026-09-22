import { finding } from './finding.js';

export const corsCheck = {
  id: 'cors-policy',
  name: 'Cross-Origin Resource Sharing',
  async run({ headers }) {
    if (
      headers['access-control-allow-origin'] !== '*' ||
      headers['access-control-allow-credentials']?.toLowerCase() !== 'true'
    )
      return [];
    return [
      finding(
        {
          id: 'cors-wildcard-credentials',
          name: 'Permissive CORS policy with credentials',
          category: 'cors',
          severity: 'MEDIUM',
          description: 'The response combines a wildcard allowed origin with credentials.',
          impact:
            'This combination is invalid in conforming browsers and often indicates a misunderstood cross-origin trust policy.',
          recommendation:
            'Allow only explicitly trusted origins and vary cached responses by Origin.',
          reference:
            'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS/Errors/CORSNotSupportingCredentials',
        },
        'Access-Control-Allow-Origin: * and Access-Control-Allow-Credentials: true were observed.',
      ),
    ];
  },
};
