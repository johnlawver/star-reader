# Deployment

Deployed via Coolify on RackNerd VPS. Auto-deploys on push to `main`.

## Domain

`https://star-reader.johnlawver.com`

## Environment Variables

| Variable       | Required | Description                          | Source  |
| -------------- | -------- | ------------------------------------ | ------- |
| `DATABASE_URL` | Yes      | PostgreSQL connection string         | Doppler |
| `AUTH_SECRET`  | Yes      | NextAuth secret                      | Doppler |
| `NEXTAUTH_URL` | Yes      | `https://star-reader.johnlawver.com` | Doppler |
| `NODE_ENV`     | Yes      | `production`                         | Coolify |

## Deploy Workflow

Secrets are managed in **Doppler** (`star-reader` project, `prd` config) and synced to Coolify before each deploy.

**Before deploying after any secret change:**

```bash
./scripts/sync-env.sh
```

This syncs all keys listed in `SYNC_KEYS` from Doppler `prd` → Coolify. Adding a new secret to the app means:

1. Add it to Doppler: `doppler secrets set KEY=value --project star-reader --config prd`
2. Add the key name to `SYNC_KEYS` in `scripts/sync-env.sh`
3. Run `./scripts/sync-env.sh`

Normal deploys (no secret changes) happen automatically on push to `main`.

## Build

- Build command: `npm run build`
- Start command: `npm start` _(runs `drizzle-kit migrate` then `node .next/standalone/server.js` — migrations apply automatically on every deploy)_
- Port: `3000`
- Health check path: `/api/health` _(dedicated endpoint, returns 200 without auth — never redirects)_

## Coolify

- Project ID: `vqehjpg67d0stxgwaarsnb0i`
- Environment ID: `cqtxm0wsjt4q5nn8sds4mja7`
- App ID: `zt40ninnaz037fgq67s2vtfx`
- Dashboard: https://dashboard.johnlawver.com
