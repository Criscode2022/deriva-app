# Neon setup

1. Create a project at [console.neon.tech](https://console.neon.tech).
2. Copy the pooled connection string (`…-pooler…` host, `sslmode=require`).
3. Put it in the repo-root `.env` as `DATABASE_URL`.
4. Start the API. On boot it creates:

- `public.users` (`id`, `email`, `password_hash`, `created_at`)
- `public.sessions` (`id`, `user_id`, `expires_at`, `revoked_at`, `created_at`)

Never expose `DATABASE_URL` to the Angular app. The browser only talks to `/api`.
