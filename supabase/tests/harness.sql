-- Minimal stand-in for the parts of a Supabase database that the migrations in
-- supabase/migrations/ depend on: the auth schema, the three PostgREST roles,
-- and auth.uid(). Loaded before the migrations by supabase/tests/run.sh so the
-- schema and its policies can be exercised on a plain PostgreSQL instance.
--
-- Not used in production. Supabase provides all of this.

CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.users (
  id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE
);

-- Supabase derives the current user from the request JWT. Here it comes from a
-- session setting the tests set with `set_config('request.jwt.claim.sub', ...)`.
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN BYPASSRLS;
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public, auth TO anon, authenticated, service_role;

-- PostgREST grants table privileges to the API roles; RLS then decides which
-- rows they may touch. Reproduced here so a policy failure shows up as a policy
-- failure and not as a missing GRANT.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;
