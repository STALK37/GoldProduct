# Changelog

All notable changes to this project are documented here. Format based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.0] — 2026-08-18

First public release.

### Security

- **Closed public read access to `customers` and `orders`.** Migration `20260228195548` had replaced
  the deny policies with `USING (true)` so the checkout could read back a row id, exposing every
  customer's name, email, phone and postal address to anyone holding the public anon key.
  `20260817090000` removes the read-back requirement instead of restoring the policy.
- **Removed the `create-admin` edge function.** It created a Supabase user with the admin role from
  an unauthenticated request body. Replaced by `scripts/create-admin.mjs`, which requires the
  service-role key.
- **Moved order creation into `place_order()`**, a `SECURITY DEFINER` function that prices the basket
  from the `products` table. The browser can no longer influence what an order costs.
- **Rewrote `telegram-notify`** to read the order from the database rather than trusting
  caller-supplied text, closing a route for pushing arbitrary messages into the owner's chat.
- **Removed the open INSERT policy on `admin_notifications`.**

### Added

- Row-level-security test suite (`supabase/tests/`) — applies every migration to a throwaway
  PostgreSQL and asserts the policies from four angles. Runs in CI.
- Vitest suite: cart behaviour, wholesale threshold, checkout payload, SEO tags — including a
  regression guard that fails if any price is ever sent from the browser.
- Playwright end-to-end suite across desktop and mobile viewports.
- `20260817090100_seed_catalogue.sql` — the product catalogue as SQL. It previously existed only in
  the hosted database, so a fresh clone produced an empty shop.
- `SETUP.md`, `SECURITY.md`, `CONTRIBUTING.md`, CI workflow, Dependabot, issue and PR templates.

### Changed

- Admin routes are lazy-loaded and vendor code is split into cacheable chunks: the storefront
  bundle dropped from 1 321 kB to 493 kB (380 kB → 148 kB gzipped).
- Canonical URLs, Open Graph tags and JSON-LD are built from `VITE_SITE_URL` instead of hardcoded
  origins.
- `tailwind.config.ts` uses an ESM import rather than `require()`.
- Admin pages are typed against the generated Supabase types instead of `any`.
- Order notifications and Telegram messages show ₴ rather than ₸.

### Removed

- The hosted-builder toolchain: `lovable-tagger`, `.lovable/`, `bun.lockb`, and the generated README.
- `.env` containing live project credentials; replaced by `.env.example`.
