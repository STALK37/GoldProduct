import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Both values are public by design -- the anon key is meant to ship in the
// browser bundle. Row-level security is what protects the data, so treat
// supabase/migrations/ as the real security boundary, not this file.
// See SECURITY.md.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  // Without this you get `Invalid supabaseUrl` from deep inside supabase-js,
  // which sends people hunting in the wrong place. Vite only reads .env at
  // startup -- if you just created it, restart the dev server.
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. " +
      "Copy .env.example to .env and fill in your project's values (see SETUP.md).",
  );
}

/**
 * Shared browser client.
 *
 *   import { supabase } from "@/integrations/supabase/client";
 */
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
