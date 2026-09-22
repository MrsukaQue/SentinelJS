import { finding } from './finding.js';

const absoluteHttp = /(?:src|href|action)\s*=\s*["']http:\/\/[^"']+["']/gi;

export const contentCheck = {
  id: 'content-transport',
  name: 'Page content transport',
  async run({ body, finalUrl }) {
    const output = [];
    const insecure = body.match(absoluteHttp) || [];
    if (finalUrl.protocol === 'https:' && insecure.length)
      output.push(
        finding(
          {
            id: 'mixed-content',
            name: 'Insecure resources referenced by HTTPS page',
            category: 'content',
            severity: 'MEDIUM',
            description: 'The page references resources using absolute HTTP URLs.',
            impact: 'Active mixed content may be blocked or exposed to network modification.',
            recommendation: 'Load every resource over HTTPS or use safe relative URLs.',
            reference: 'https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content',
          },
          `${insecure.length} HTTP resource reference(s) were observed.`,
          { component: 'HTML document' },
        ),
      );
    const insecureForms = [
      ...body.matchAll(/<form\b[^>]*action\s*=\s*["'](http:\/\/[^"']*)["'][^>]*>/gi),
    ];
    if (insecureForms.length)
      output.push(
        finding(
          {
            id: 'insecure-form-action',
            name: 'Form submits over HTTP',
            category: 'content',
            severity: 'HIGH',
            description: 'A form action explicitly targets an HTTP URL.',
            impact: 'Submitted data may travel without transport encryption.',
            recommendation: 'Submit forms only to HTTPS endpoints.',
          },
          `${insecureForms.length} form action(s) used HTTP.`,
          { component: 'HTML form' },
        ),
      );
    if (finalUrl.protocol === 'http:' && /<form\b/i.test(body))
      output.push(
        finding(
          {
            id: 'form-on-http-page',
            name: 'Form served without HTTPS',
            category: 'content',
            severity: 'HIGH',
            description: 'A form was observed on a page loaded over HTTP.',
            impact: 'The page and submitted data can be observed or modified in transit.',
            recommendation: 'Serve the page and all form destinations exclusively over HTTPS.',
          },
          'At least one form was present on an HTTP page.',
          { component: 'HTML form' },
        ),
      );
    return output;
  },
};
