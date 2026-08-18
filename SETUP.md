# Setup

The storefront's static pages render with no backend at all. The **catalogue, cart, checkout,
contact form and admin panel** need Supabase. This document covers both.

## 1. Frontend only (2 minutes)

```bash
git clone https://github.com/STALK37/GoldProduct.git
cd GoldProduct
npm install
cp .env.example .env      # placeholders are fine for a look around
npm run dev               # http://localhost:8080
```

Home, About, Where to buy, Cooperation and Contacts all render. The catalogue is empty, because
products live in Postgres. That's step 2.

## 2. Full stack with Supabase (~15 minutes)

### 2.1 Create a project

Sign in at [supabase.com](https://supabase.com) → **New project**. Note the project ref from the
dashboard URL (`https://supabase.com/dashboard/project/<ref>`).

### 2.2 Apply the schema and the catalogue

```bash
npm i -g supabase
supabase login
supabase link --project-ref <your-ref>
supabase db push
```

`supabase/migrations/` holds the full history: nine tables, the row-level-security policies, the
`place_order()` function, and **the product catalogue itself**. When this finishes you have fifteen
products with prices, pack weights and gallery images.

> [!IMPORTANT]
> Apply them in order and apply all of them. `20260228195548` leaves customer and order data
> publicly readable; `20260817090000` is the migration that closes it. See [SECURITY.md](SECURITY.md).

### 2.3 Deploy the edge function

```bash
supabase functions deploy telegram-notify
```

### 2.4 Set the function secrets

These live server-side only — never in `.env`.

```bash
# A bot from @BotFather, and the chat to post orders into.
supabase secrets set TELEGRAM_BOT_TOKEN="123456:ABC..." TELEGRAM_CHAT_ID="-1001234567890"
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically — don't set them yourself.

Group chat ids are negative and start with `-100`. To find yours, add the bot to the group, send a
message, then open
`https://api.telegram.org/bot<TOKEN>/getUpdates` and read `result[0].message.chat.id`.

### 2.5 Point the frontend at it

Copy the values from **Project Settings → API** into `.env`:

```bash
VITE_SUPABASE_URL="https://your-ref.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-public-key"
VITE_SUPABASE_PROJECT_ID="your-ref"
VITE_SITE_URL="https://your-domain.com"
```

Restart `npm run dev`. The catalogue fills in, and checkout writes real orders.

### 2.6 Create your admin account

```bash
SUPABASE_URL="https://your-ref.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>" \
node scripts/create-admin.mjs you@example.com
```

It prints a generated password once. Sign in at `/admin` and change it.

> [!WARNING]
> The service-role key bypasses row-level security completely. Paste it into this one command,
> don't put it in `.env`, and never ship it to a browser or a deployed endpoint.

## Verifying the security model

Before you go live, prove the policies do what you think:

```bash
npm run test:rls
```

This applies every migration to a throwaway PostgreSQL and asserts, among other things, that
`customers` and `orders` are unreadable with the anon role and that a client-supplied price is
ignored. It needs PostgreSQL server binaries — `apt install postgresql-16` or
`brew install postgresql@16` — but no Supabase project and no network.

You can also check the live project directly:

```sql
select tablename, policyname, cmd, qual
from pg_policies
where tablename in ('customers','orders')
order by tablename;
```

Nothing should show `qual = true` on a `SELECT`.

## Deploy

```bash
npm run build     # → dist/
```

Any static host works — Netlify, Vercel, Cloudflare Pages, S3 + CloudFront. Two things to get right:

1. **Set the `VITE_*` variables in the host's environment**, including `VITE_SITE_URL`. Canonical
   tags and Open Graph URLs are built from it; leaving it pointing at someone else's domain hands
   them your search ranking.
2. **Configure an SPA fallback to `index.html`** so client-side routes survive a hard refresh.
   Netlify: `/* /index.html 200` in `_redirects`. Vercel: a rewrite of `/(.*)` to `/index.html`.

`public/sitemap.xml` and `public/robots.txt` are static files — Vite copies them verbatim and they
cannot read environment variables. If you deploy to a different domain, edit the `<loc>` entries and
the `Sitemap:` line by hand.

## Troubleshooting

**Blank page, console shows the missing-env error** — `.env` is absent or was added after the dev
server started. Vite reads it only at startup; restart.

**Catalogue is empty** — the migrations didn't run, or ran against a different project. Check
`select count(*) from products;` in the SQL editor. Expect 17 (15 products plus the 2 category rows).

**Checkout fails with "One or more products are unavailable"** — the basket references a product id
that isn't in the database, or `in_stock` is false. This is `place_order()` refusing to guess.

**Orders save but Telegram stays quiet** — `supabase functions logs telegram-notify`. Almost always
a wrong `TELEGRAM_CHAT_ID`.

**Admin panel shows an empty order list** — your user has no row in `user_roles`. Run
`scripts/create-admin.mjs` again with the same email; it grants the role to an existing account.
