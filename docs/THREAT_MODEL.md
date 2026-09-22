# Threat model

## Assets and trust boundaries

SentinelJS stores user identities, target URLs, scan metadata, and concise findings. Browser traffic crosses the public API boundary; target URLs cross a second, hostile network boundary; jobs cross Redis; durable records cross PostgreSQL. Passwords, session tokens, full response bodies, and cookie values must not appear in logs or findings.

## Primary threats and controls

- **SSRF and internal discovery:** only absolute HTTP(S) URLs on ports 80/443 are accepted. Credentials, localhost names, private, loopback, link-local, carrier-grade NAT, documentation, multicast, reserved, and known metadata destinations are rejected. All DNS answers must be public. Each redirect repeats URL and DNS validation.
- **DNS rebinding:** the validated IP is pinned through the request `lookup` callback and compared with the connected socket address. A later redirect receives a fresh validation.
- **Resource exhaustion:** redirects, response bytes, request duration, JSON bodies, authentication attempts, and scan creation are limited. BullMQ bounds worker concurrency.
- **Unauthorized data access:** scan queries include the authenticated user ID; session JWTs use issuer/audience/expiry checks in HTTP-only, SameSite=Strict cookies. Socket subscriptions repeat authentication and ownership checks.
- **Sensitive data retention:** the worker retains only derived findings and metadata. Response bodies and cookie values are held in memory only for the current scan.
- **Scanner abuse:** checks issue only GET requests and inspect the returned response. SentinelJS does not submit forms, authenticate to targets, fuzz inputs, bypass controls, or execute discovered scripts.

## Known limitations

The process DNS resolver is trusted, proxy environment variables are not used, and outbound firewalling remains a recommended deployment control. IPv6 textual classification covers the reserved ranges relevant to this scanner but should be complemented by container/network egress policy. A public host could proxy private content, and application-level authorization cannot detect that case. TLS validation relies on Node's trust store and hostname checks. Passive observations can miss controls applied only to other routes or user sessions.

Operators should enforce container egress to public TCP ports 80/443, isolate Redis and PostgreSQL, terminate TLS before the frontend/API, rotate the JWT secret, and keep dependencies current.
