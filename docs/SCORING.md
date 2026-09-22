# Scoring model

Every scan starts at 100. Each reported finding deducts a fixed amount:

| Severity | Deduction | Meaning |
| --- | ---: | --- |
| Critical | 25 | Direct, severe exposure observable through a passive check |
| High | 12 | Important missing protection or unsafe transport behavior |
| Medium | 6 | Material weakness that requires context to assess |
| Low | 2 | Defense-in-depth or privacy hardening opportunity |
| Informational | 0 | Useful observation without a demonstrated security impact |

The floor is zero. Repeated findings are deducted independently because each affected component may need remediation. The API includes the deduction on every finding so the result can be reproduced.

A score summarizes this limited passive inspection. It does not certify a target, prove exploitability, or establish that a site is secure or vulnerable.
