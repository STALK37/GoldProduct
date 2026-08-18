## What this changes

## Why

## Checklist

- [ ] `npm run lint` is clean
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes
- [ ] `npm run test:rls` passes — **required if any migration or policy changed**
- [ ] `npm run test:e2e` passes
- [ ] No price, total or amount is sent from the browser to the database
- [ ] New migrations are additive and named `YYYYMMDDHHMMSS_description.sql`
