import { finding } from './finding.js';

export const disclosureCheck = {
  id: 'information-disclosure',
  name: 'Technology disclosure',
  async run({ headers, body }) {
    const output = [];
    for (const header of ['server', 'x-powered-by']) {
      if (headers[header])
        output.push(
          finding(
            {
              id: `exposed-${header}`,
              name: `${header} header exposes implementation details`,
              category: 'disclosure',
              severity: 'INFORMATIONAL',
              description: 'The response exposes server implementation information.',
              impact:
                'Version or product details may help an attacker prioritize research, but do not prove a vulnerability.',
              recommendation: `Remove or minimize the ${header} header where operationally practical.`,
            },
            `${header}: ${headers[header]}`,
          ),
        );
    }
    if (/\b(stack trace|traceback \(most recent|at\s+[\w.$]+\s+\([^)]*:\d+:\d+\))/i.test(body))
      output.push(
        finding(
          {
            id: 'verbose-error',
            name: 'Possible verbose error information',
            category: 'disclosure',
            severity: 'MEDIUM',
            description: 'The normal response contained text resembling a stack trace.',
            impact: 'Stack traces can expose internal paths and implementation details.',
            recommendation:
              'Return generic errors to clients and retain details only in protected logs.',
          },
          'The fetched page contained a stack-trace-like pattern. No error was intentionally triggered.',
        ),
      );
    return output;
  },
};
