import { createClient } from '@supabase/supabase-js';

// Server-only. Uses the service role key, which bypasses RLS entirely.
// NEVER import this into a client component, and never expose
// SUPABASE_SERVICE_ROLE_KEY to the browser (keep it out of anything
// prefixed NEXT_PUBLIC_).
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}