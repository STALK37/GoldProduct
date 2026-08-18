# Security

## Reporting a vulnerability

Please **do not open a public issue**. Open a
[private security advisory](https://github.com/STALK37/GoldProduct/security/advisories/new) instead,
or email the address in the repository owner's GitHub profile. You can expect an acknowledgement
within a few days.

## The model in one paragraph

The anon key ships in the JavaScript bundle. That is what it is for, and no amount of hiding it
helps. **Row-level security is the security boundary**, so `supabase/migrations/` is the file set to
review, not the frontend. The service-role key bypasses RLS entirely and belongs only in Supabase
function secrets and on the maintainer's machine — never in `.env`, never in the bundle, never in a
deployed endpoint's request body.

## What anonymous visitors may do

| Table | SELECT | INSERT | UPDATE / DELETE |
|---|---|---|---|
| `products` | ✅ the catalogue | ❌ | ❌ |
| `product_images` | ✅ the gallery | ❌ | ❌ |
| `customers` | ❌ | ❌ *(via `place_order` only)* | ❌ |
| `orders` | ❌ | ❌ *(via `place_order` only)* | ❌ |
| `order_items` | ❌ | ❌ *(via `place_order` only)* | ❌ |
| `contact_requests` | ❌ | ✅ the contact form | ❌ |
| `admin_notifications` | ❌ | ❌ *(trigger only)* | ❌ |
| `user_roles` | ❌ | ❌ | ❌ |

Authenticated administrators — users with a row in `user_roles` — additionally read `customers`,
`orders`, `order_items` and `admin_notifications`, and may update an order's status.

Everything in that table is asserted by [`supabase/tests/rls.sql`](supabase/tests/rls.sql), which
runs in CI against a real PostgreSQL. A policy regression is silent — the app keeps working while
the data is open — so it gets tests rather than a code review.

## Two vulnerabilities this repository fixes

Both were live. They are documented here because the shapes are common in projects that grow inside
a hosted app builder, and because the fixes are the most interesting code in the repo.

### 1. Customer and order data readable by anyone

Migration `20260228195548` dropped the `"Customers not publicly readable"` and
`"Orders not publicly readable"` policies and replaced them with `USING (true)`, so the checkout
could read the new row's id back from `INSERT ... RETURNING`. A reasonable-looking fix for a real
problem, and it exposed **every customer's name, email, phone and full postal address** to anyone
who copied the anon key out of the bundle.

Fixed in `20260817090000` by removing the read-back requirement entirely rather than restoring a
policy that would have broken checkout: `place_order()` runs as its definer and returns just the
order id and total.

### 2. An open admin-creation endpoint

The project shipped a `create-admin` edge function that took an email and a password from the
request body and created a **Supabase user with the admin role**, with no authentication check.
Requiring a JWT would not have helped: the anon key is a valid JWT and it is public. Anyone who knew
the URL could make themselves an administrator, and from there read everything in the table above.

The function is deleted. Bootstrapping an admin now runs through
[`scripts/create-admin.mjs`](scripts/create-admin.mjs), which requires the service-role key, so the
capability exists only where the key does.

## Deliberate remaining trade-offs

- **`telegram-notify` is callable with the anon key.** It accepts only an order id and reads
  everything else from the database, so the worst case is re-sending a notification for an order
  whose UUID the caller already knows. UUID guessing is not a practical attack; if you want it
  closed anyway, move the call behind a database trigger with `pg_net`.
- **`contact_requests` accepts anonymous inserts.** That is what a contact form is. Add a captcha or
  a rate limit if you start seeing spam.
- **No rate limit on `place_order`.** It creates real rows, so a determined script can fill the
  orders table with junk. Supabase's built-in API rate limits apply; add a stricter one if the shop
  gets attention.

## If you are deploying this against an existing project

Run the migrations in order. `20260817090000` is the one that closes the reads — applying the
earlier migrations without it leaves customer data public. After applying it, confirm with:

```sql
select tablename, policyname, cmd, qual
from pg_policies
where tablename in ('customers','orders','order_items')
order by tablename, cmd;
```

No row should show `qual = true` for a `SELECT` on `customers` or `orders`.
