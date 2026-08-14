# Vercel deploy

This monorepo is a **single Vercel project**:

- Static files from `apps/web/dist/web/browser`
- NestJS as `api/index.js` (includes `apps/api/dist/**`)

## Environment variables

| Name | Required | Notes |
|------|----------|--------|
| `DATABASE_URL` | yes | Neon pooled URL |
| `JWT_SECRET` | yes | `openssl rand -hex 32` |
| `ALLOWED_ORIGINS` | yes in prod | `https://your-app.vercel.app` |
| `API_BASE_URL` | no | defaults to `/api` |
| `ALLOW_VERCEL_PREVIEWS` | no | default `true` |
| `SESSION_TTL_SECONDS` | no | default `86400` |

## First deploy

Install on Vercel uses `pnpm install --frozen-lockfile`. The build is `pnpm exec turbo run build --filter=@repo/web --filter=@repo/api`.

1. `vercel` (or Import Git in the dashboard) from the repo root.
2. Set the env vars on Production and Preview.
3. Confirm `/api/health` returns `{ "ok": true }`.
4. Add the production origin to `ALLOWED_ORIGINS`.
