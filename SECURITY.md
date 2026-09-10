# Security policy

If you find a vulnerability in Levanbook, **do not open a public GitHub issue**.

## Report privately

Use GitHub **private vulnerability reporting** on this repository (Security → Advisories), or email [security@levansolution.com](mailto:security@levansolution.com) with:

- a short description of the issue
- steps to reproduce
- impact (data exposure, account takeover, storage abuse, etc.)

We will acknowledge reports as soon as we can and coordinate a fix before any public disclosure.

## Scope

In scope:

- authentication and session handling
- Row Level Security on `books` and `storage.objects`
- the public PDF proxy at `/api/public/[slug]/pdf`
- secret leakage in the client bundle or repository

Out of scope:

- brute-force without demonstrating a bypass of rate limits
- issues that require leaked admin keys (`INSFORGE_API_KEY`)
- reports against a third-party InsForge project that is not yours

## Production hardening

- Keep `INSFORGE_API_KEY` as a server-only environment variable. Never prefix it with `NEXT_PUBLIC_`.
- Configure rate limiting for `/api/public/*` in Vercel Firewall or Cloudflare. A serverless process cannot enforce a reliable global limit by itself.
- Confirm InsForge `allowed_redirect_urls` includes the production origin, not only `localhost`.
- Rotate the admin API key if it may have been shared in screenshots, CI logs, or chat.
