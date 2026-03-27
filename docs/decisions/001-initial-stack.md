# 001 — Initial Stack Choice

## Context

Building a mobile-first reading tracker for a kindergartener using Scholastic graded readers. Needs book lookup (Google Books API), camera barcode scanning, a star/reward system, and a parent-gated admin section. Will be deployed to Coolify on RackNerd VPS.

## Decision

**Next.js (App Router) + PostgreSQL + Drizzle ORM + NextAuth v5 + Tailwind CSS**

- **Next.js App Router**: full-stack in one repo, excellent mobile-first support, strong ecosystem, fits Coolify's nixpacks deploy
- **Drizzle ORM** over Prisma: TypeScript-native inference, no codegen step, lighter bundle, sufficient for this schema complexity
- **NextAuth v5**: handles email/password Credentials provider cleanly with App Router; simpler than rolling custom auth
- **Tailwind CSS**: rapid iteration on a custom kid-friendly theme; no design system needed at this scale
- **Google Books API**: free, no key required for basic lookups, returns cover art and ISBNs; reading level surfaced where available, parent can override

## Consequences

- `output: 'standalone'` required in `next.config.ts` for Coolify nixpacks deploys
- Drizzle migrations are manual (run `drizzle-kit migrate` before first deploy and after schema changes)
- NextAuth v4 is NOT compatible with App Router — must stay on v5 (beta)
- Barcode scanning requires HTTPS in production (camera API restriction); works on localhost in dev
