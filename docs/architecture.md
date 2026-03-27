# Architecture

## Overview

Star Reader is a mobile-first web app for tracking reading progress in Scholastic graded readers. A parent account holds the household data. Children see a playful dashboard of completed books and star totals. A PIN-gated parent section manages book catalog, star rules, and the reward store.

## Data Flow

1. Parent signs up with email/password (NextAuth Credentials)
2. Parent adds children to the account
3. Books are added via barcode scan, ISBN, title search (Google Books API), or manual entry
4. When a child completes a book, a parent marks it complete — stars are awarded per configured rules
5. Stars accumulate and can be spent in the parent-managed reward store

## Components

| Component | Responsibility |
|-----------|---------------|
| `app/(kid)/` | Kid-facing dashboard — completed books, star count, celebration UI |
| `app/(parent)/` | PIN-gated parent section — manage children, books, rewards, star config |
| `app/api/auth/` | NextAuth v5 handler |
| `lib/db/schema.ts` | Drizzle schema — users, children, books, reading_logs, star_transactions, rewards |
| `lib/google-books.ts` | Google Books API fetch by ISBN or title |
| `components/BarcodeScanner` | Camera-based ISBN scanner (html5-qrcode, client component) |

## Key Design Decisions

- See [001-initial-stack.md](decisions/001-initial-stack.md) for stack rationale
- Parent auth: email/password via NextAuth Credentials provider
- Child access: no separate login — gated by parent session; parent section requires PIN re-entry
- Reading levels: pulled from Google Books where available, always overridable by parent
- Star rules: configurable per account (flat rate or per-level multiplier)
