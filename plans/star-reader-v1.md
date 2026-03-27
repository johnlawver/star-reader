# Plan: Star Reader v1

> Source PRD: [johnlawver/star-reader#1](https://github.com/johnlawver/star-reader/issues/1)

## Architectural Decisions

Durable decisions that apply across all phases:

- **Routes**: `/` kid dashboard, `/login`, `/signup`, `/parent/*` (PIN-gated parent section), `/api/auth/*` (NextAuth handler)
- **Schema models**: `users`, `children`, `books`, `star_transactions`, `rewards`, `redemptions`
- **Auth**: NextAuth v5 Credentials provider — parent session stored in cookie; parent gate is a separate short-lived cookie scoped to `/parent/*` routes
- **Star balance**: always derived from `star_transactions` aggregate — no mutable balance column on `children`
- **Google Books**: server-side wrapper only — never called from the client; barcode scanner runs client-side and fires a server action on result
- **Redemptions**: snapshot reward name, description, and star cost at time of redemption so history is accurate if reward is later edited or deleted
- **Deployment**: `output: 'standalone'` in next.config.ts; nixpacks on Coolify; secrets via Doppler

---

## Phase 1: Foundation — Auth + Deployment

**User stories**: 1, 2, 3

### What to build

Bootstrap the Next.js app with Drizzle schema, NextAuth v5 Credentials provider, and deploy to Coolify. A parent can sign up with email and password, log in, and reset their password. The app is live and accessible at `star-reader.johnlawver.com`. This phase establishes the deployment pipeline and the auth baseline everything else builds on.

### Acceptance criteria

- [ ] Parent can sign up with email and password
- [ ] Parent can log in and is redirected to the kid dashboard
- [ ] Parent can request a password reset email and set a new password
- [ ] Unauthenticated requests to protected routes redirect to `/login`
- [ ] App is deployed and accessible at `https://star-reader.johnlawver.com`
- [ ] `DATABASE_URL`, `AUTH_SECRET`, and `NEXTAUTH_URL` are set in Doppler and working in production
- [ ] Drizzle migrations run successfully against the production database

---

## Phase 2: Child Profiles + Kid Dashboard Shell

**User stories**: 4, 5, 6, 7, 8, 36, 37, 38, 39, 40, 41, 42

### What to build

A parent can add children to their account, each with a name and avatar selected from a predefined illustrated set. The kid dashboard displays a profile switcher (avatar-based, no reading required) so any child can find themselves. Each child's dashboard shows their star count (zero to start), a "currently reading" section (empty state), and a completed books grid (empty state). The playful, colorful visual theme is established in this phase — large tap targets, bright colors, friendly typography — so all future phases build on top of it.

### Acceptance criteria

- [ ] Parent can add a child with a name and avatar
- [ ] Parent can edit a child's name or avatar
- [ ] Parent can delete a child profile
- [ ] Kid dashboard shows an avatar-based profile switcher when multiple children exist
- [ ] Tapping a child avatar switches to that child's dashboard
- [ ] Dashboard displays the child's star count (shows 0 with no completions)
- [ ] Dashboard shows an empty state for "currently reading" and "completed books"
- [ ] UI is visually playful, colorful, and mobile-first — large tap targets throughout
- [ ] All kid-facing navigation works without reading ability (icons and avatars, not text labels)

---

## Phase 3: Book Catalog — Manual Entry

**User stories**: 14, 15, 21, 22, 24, 25, 26, 27

### What to build

A parent can manually add a book to a child's catalog when the child starts reading it. The form accepts title, author, reading level, and an optional cover image upload. If no cover is provided, a default illustrated placeholder is shown. The book appears in the child's "currently reading" section on the kid dashboard. Parents can edit book details and remove books from the catalog. This phase makes the catalog functional without any API dependency.

### Acceptance criteria

- [ ] Parent can add a book manually with title, author, reading level, and optional cover
- [ ] Books with no cover show a default placeholder image
- [ ] Parent can upload a custom cover image for a book
- [ ] Newly added book appears in the child's "currently reading" list on the dashboard
- [ ] Parent can edit a book's title, author, level, or cover after adding it
- [ ] Parent can remove a book from the catalog
- [ ] Each child has their own independent catalog (books are not shared between children)
- [ ] Completed and in-progress books are displayed in separate sections

---

## Phase 4: Book Lookup — Google Books

**User stories**: 17, 18, 19, 20

### What to build

When adding a book, a parent can search by title or ISBN and have metadata populated automatically from the Google Books API. The lookup runs server-side and returns title, author, cover art URL, and reading level where available. The parent always sees a confirm/override step for the reading level before saving — the field is pre-filled if the API returned a value but always editable. Fields not returned by the API fall back to manual entry. This replaces the add-book flow from Phase 3 with an enriched version that still supports full manual override.

### Acceptance criteria

- [ ] Parent can search for a book by title and see results with cover art
- [ ] Parent can search for a book by ISBN and get a direct match
- [ ] Book metadata (title, author, cover) is pre-filled from Google Books results
- [ ] Reading level is pre-filled if available from the API
- [ ] Reading level field is always shown and always editable before saving
- [ ] Missing API fields fall back to blank inputs the parent can fill in manually
- [ ] Google Books API is never called from the client — all lookups go through a server action

---

## Phase 5: Book Lookup — Barcode Scanner

**User stories**: 16, 23

### What to build

A parent can tap a "Scan Barcode" button on the add-book screen to open a camera-based barcode scanner. On a successful scan, the ISBN is extracted and passed to the Google Books lookup from Phase 4, pre-filling the form exactly as a manual ISBN search would. If the camera is unavailable or the scan fails, the parent falls back to manual ISBN entry. A parent can also upload a custom cover image to replace whatever the API returned.

### Acceptance criteria

- [ ] "Scan Barcode" button opens the device camera on mobile
- [ ] Scanning a book barcode extracts the ISBN and triggers a Google Books lookup
- [ ] Scan result pre-fills the add-book form identically to a manual ISBN search
- [ ] If the camera is unavailable, the parent can type the ISBN manually instead
- [ ] Parent can upload a custom cover image to override the API cover
- [ ] Scanner works on HTTPS production domain; works on localhost in dev

---

## Phase 6: Complete a Book + Star Engine

**User stories**: 28, 29, 30, 31, 32, 33, 34, 35

### What to build

A parent can mark a book as complete for a child. On completion, the star engine calculates stars earned based on the household's configured rule — either flat (1 star per book regardless of level) or per-level (stars equal the book's reading level number). The engine writes a star transaction record and the child's derived star balance updates immediately. On the kid dashboard, completing a book triggers a celebration animation. The parent can change the star rule at any time; changes apply to future completions only. Completed books move from "currently reading" to the completed books grid with their cover art.

### Acceptance criteria

- [ ] Parent can mark a book as complete from the book detail or catalog view
- [ ] Star engine calculates stars correctly for the flat rule (always 1)
- [ ] Star engine calculates stars correctly for the per-level rule (level = star count; defaults to 1 if level unknown)
- [ ] A star transaction record is written for each book completion
- [ ] Child's star count on the dashboard updates immediately after completion
- [ ] Completed book moves to the completed books grid with its cover art
- [ ] Celebration animation plays on the kid dashboard when a book is marked complete
- [ ] Parent can switch between flat and per-level star rules in settings
- [ ] Rule changes apply to future completions only — past transactions are unchanged

---

## Phase 7: Parent Gate

**User stories**: 9, 10, 11, 12, 13

### What to build

All `/parent/*` routes are protected by a secondary challenge on top of the existing parent session. The parent can choose between two gate types: a 4-6 digit PIN or a server-generated multiplication problem with multiple choice answers. The gate type and PIN hash are stored on the user record. A successful challenge issues a short-lived gate session scoped to the parent section; the parent is not re-prompted until it expires. The math problem is generated and validated server-side — the client only receives the question and answer choices.

### Acceptance criteria

- [ ] All `/parent/*` routes require passing the gate challenge before access
- [ ] Parent can configure gate type (PIN or math problem) in account settings
- [ ] PIN gate: correct PIN grants access; incorrect PIN shows an error
- [ ] Math gate: server generates a multiplication problem with 4-5 multiple choice options
- [ ] Math gate: answer is validated server-side, not client-side
- [ ] Successful challenge issues a short-lived gate session; parent is not re-prompted until it expires
- [ ] Parent can update their PIN
- [ ] Gate type can be switched without affecting main login credentials

---

## Phase 8: Reward Store — Parent Management

**User stories**: 43, 44, 45

### What to build

Inside the parent section, a parent can create prizes for the reward store. Each reward has a name, description, and star cost. Parents can edit or delete rewards, and toggle them active or inactive (inactive rewards are hidden from the kid-facing store without being deleted). This phase sets up the store data without any kid-facing UI.

### Acceptance criteria

- [ ] Parent can create a reward with name, description, and star cost
- [ ] Parent can edit any field of an existing reward
- [ ] Parent can delete a reward
- [ ] Parent can toggle a reward between active and inactive
- [ ] Inactive rewards are hidden from all kid-facing views
- [ ] Reward management is inside the parent section and requires passing the parent gate

---

## Phase 9: Reward Store — Kid View + Redemption

**User stories**: 46, 47, 48, 49, 50

### What to build

The kid dashboard includes a reward store section showing all active rewards with their cover, name, and star cost. For rewards the child cannot yet afford, the display shows how many more stars are needed. Redemption is parent-gated in v1: the child can browse but tapping "redeem" triggers the parent gate challenge. On successful gate entry, the parent confirms the redemption — stars are deducted and a redemption record is created that snapshots the reward's details at that moment. Parents can view a per-child redemption history. The redemption flow is architected so the gate requirement can be removed in a future version to enable child-facing redemption.

### Acceptance criteria

- [ ] Active rewards are visible on the kid dashboard store section
- [ ] Each reward shows name, description, star cost, and cover or illustration
- [ ] Rewards the child cannot afford show how many more stars are needed
- [ ] Tapping "redeem" on any reward triggers the parent gate challenge
- [ ] On successful gate entry, parent confirms the redemption
- [ ] Stars are deducted from the child's derived balance on confirmation
- [ ] Redemption record is created with a snapshot of the reward at time of redemption
- [ ] Child cannot redeem a reward if their star balance is insufficient
- [ ] Parent can view redemption history per child inside the parent section
