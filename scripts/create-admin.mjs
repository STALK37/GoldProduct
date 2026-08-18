#!/usr/bin/env node
/**
 * Promote an email address to a store administrator.
 *
 * This replaces the `create-admin` edge function the project used to ship,
 * which accepted an email and password from any caller and handed back an admin
 * account -- the anon key is public, so that was an open door. Admin creation is
 * a once-a-year operation, so it belongs in a script the owner runs with the
 * service-role key, not in a deployed endpoint.
 *
 *   SUPABASE_URL="https://<ref>.supabase.co" \
 *   SUPABASE_SERVICE_ROLE_KEY="<service-role-key>" \
 *   node scripts/create-admin.mjs owner@example.com
 *
 * The service-role key bypasses row-level security entirely. Read it from your
 * password manager, keep it out of .env, and never let it near the frontend.
 * Find it under Dashboard -> Project Settings -> API -> service_role.
 *
 * If the user already exists, only the admin role is granted.
 */
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
const email = process.argv[2];

const die = (message) => {
  console.error(`\n  ✗ ${message}\n`);
  process.exit(1);
};

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  die("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.");
}
if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  die("Usage: node scripts/create-admin.mjs <email>");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// 24 random bytes -> 32 base64url characters. Printed once, never stored.
const password = randomBytes(24).toString("base64url");

const { data: created, error: createError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

let userId = created?.user?.id;
let generatedPassword = password;

if (createError) {
  // Already registered: grant the role, leave the existing password alone.
  const { data: list, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (listError) die(`Could not create or look up the user: ${createError.message}`);

  const existing = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!existing) die(`Could not create the user: ${createError.message}`);

  userId = existing.id;
  generatedPassword = null;
  console.log(`\n  • ${email} already exists — granting the admin role only.`);
}

const { error: roleError } = await supabase
  .from("user_roles")
  .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });

if (roleError) die(`Could not grant the admin role: ${roleError.message}`);

console.log(`\n  ✓ ${email} is now an administrator.`);
if (generatedPassword) {
  console.log(`\n    Temporary password: ${generatedPassword}`);
  console.log("    Shown once. Sign in at /admin and change it immediately.\n");
} else {
  console.log("    Sign in at /admin with the existing password.\n");
}
