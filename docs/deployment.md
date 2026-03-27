# Deployment

Deployed via Coolify on RackNerd VPS. Auto-deploys on push to `main`.

## Domain

`https://star-reader.johnlawver.com`

## Environment Variables

| Variable | Required | Description | Source |
|----------|----------|-------------|--------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | Doppler |
| `AUTH_SECRET` | Yes | NextAuth secret | Doppler |
| `NEXTAUTH_URL` | Yes | `https://star-reader.johnlawver.com` | Doppler |
| `NODE_ENV` | Yes | `production` | Coolify |

## Build

- Build command: `npm run build`
- Start command: `npm start`
- Port: `3000`
- Health check path: `/`

## Coolify

- Project ID: `vqehjpg67d0stxgwaarsnb0i`
- Environment ID: `cqtxm0wsjt4q5nn8sds4mja7`
- App ID: *(fill after app creation)*
- Dashboard: https://dashboard.johnlawver.com
