# Levanbook

Turn PDFs into a page-turning book. Keep a private library, or share a reading link.

Built with [Next.js](https://nextjs.org/) 16 and [InsForge](https://insforge.dev) (Postgres, auth, and storage).

## Features

- Upload PDFs (up to 100 MB) to a personal library
- Flip through pages in the browser
- Try a PDF locally without an account
- Share a public `/b/[slug]` link; revoke it anytime
- Spanish / English UI

## Stack

- Next.js App Router, React 19, Tailwind CSS 4
- `@insforge/sdk` for auth, database, and storage
- PDF.js + StPageFlip for rendering and page turns

Third-party licenses that ship with the app include [PDF.js](https://github.com/mozilla/pdf.js) (Apache 2.0) via `pdfjs-dist` and `public/pdf.worker.min.mjs`.

## Setup

1. Create an InsForge project and a storage bucket named `books`.
2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Fill `.env.local`:

| Variable | Where it runs | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_INSFORGE_URL` | Browser and server | InsForge API origin |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | Browser | Public anon key. Protect data with RLS, not secrecy. |
| `NEXT_PUBLIC_APP_URL` | Server | App origin used in auth redirects |
| `INSFORGE_URL` | Server | Same origin as the public URL, used by the admin client |
| `INSFORGE_API_KEY` | **Server only** | Admin key. Never put this in `NEXT_PUBLIC_*` or client code. |

4. Apply SQL in `migrations/` with the InsForge CLI (`db migrations up --all`) so RLS matches this repo.
5. In InsForge auth settings, add production redirect URLs in addition to the localhost values in `insforge.toml`.
6. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Security model

Anonymous visitors **cannot** query `books` or `storage.objects`. Shared reading goes through the server:

1. `/b/[slug]` loads the title with the admin client (server-only).
2. `/api/public/[slug]/pdf` checks that the slug is public, then streams the PDF.

Owners still upload, list, and download their own files with the authenticated client and owner RLS policies.

Before going live:

- Rotate `INSFORGE_API_KEY` if it may have leaked outside the hosting dashboard.
- Add rate limiting on `/api/public/*` (Vercel Firewall or Cloudflare). This app does not keep a global in-memory limiter because it would not hold on serverless.
- See [SECURITY.md](SECURITY.md) for private vulnerability reports.

## Deploy

Vercel (or any Node host) needs **all** of the variables above. `INSFORGE_API_KEY` must be a secret, not a public env var.

```bash
npm run build
npm start
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run clean` | Delete `.next` cache |

## License

[MIT](LICENSE) © LevanSolution
