#!/usr/bin/env bash
#
# Applies every migration to a throwaway PostgreSQL instance and runs the
# row-level-security tests against it. No Supabase project, no network.
#
#   ./supabase/tests/run.sh
#
# Needs PostgreSQL 14+ binaries on PATH (Debian/Ubuntu: postgresql-16, macOS:
# `brew install postgresql@16`). The cluster is created under a temporary
# directory and torn down on exit, including on failure.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# initdb refuses to run as root. Inside a container that is exactly who you are,
# so hand off to the postgres user if one exists.
if [ "$(id -u)" -eq 0 ] && id postgres >/dev/null 2>&1; then
  exec su postgres -s /bin/bash -c "$(printf '%q ' "${BASH_SOURCE[0]}" "$@")"
fi

PGPORT="${PGPORT:-55432}"
PGDATA="$(mktemp -d)/data"
SOCKET="$(mktemp -d)"

# Debian and Ubuntu keep the server binaries out of PATH.
for dir in /usr/lib/postgresql/*/bin /opt/homebrew/opt/postgresql@*/bin; do
  [ -x "$dir/initdb" ] && PATH="$dir:$PATH"
done
export PATH

command -v initdb >/dev/null || {
  echo "initdb not found — install PostgreSQL server binaries." >&2
  exit 1
}

cleanup() {
  pg_ctl -D "$PGDATA" -m immediate stop >/dev/null 2>&1 || true
  rm -rf "$PGDATA" "$SOCKET"
}
trap cleanup EXIT

echo "→ starting a temporary PostgreSQL on port $PGPORT"
initdb -D "$PGDATA" -A trust -U postgres >/dev/null
pg_ctl -D "$PGDATA" -o "-p $PGPORT -k $SOCKET -c listen_addresses=''" -l "$PGDATA/log" -w start >/dev/null

psql_() { psql -h "$SOCKET" -p "$PGPORT" -U postgres -d gp_test -v ON_ERROR_STOP=1 "$@"; }

createdb -h "$SOCKET" -p "$PGPORT" -U postgres gp_test

echo "→ loading the Supabase stand-in (auth schema, API roles)"
psql_ -q -f "$ROOT/supabase/tests/harness.sql"

echo "→ applying migrations"
for migration in "$ROOT"/supabase/migrations/*.sql; do
  printf '   %s\n' "$(basename "$migration")"
  psql_ -q -f "$migration"
done

echo "→ running row-level-security tests"
# Results to /dev/null: the assertions report through NOTICE, and psql would
# otherwise print an empty row per assert.
cd "$ROOT" && psql_ -q -o /dev/null -f supabase/tests/rls.sql
