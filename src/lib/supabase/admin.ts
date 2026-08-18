import { createClient } from "@supabase/supabase-js";

/**
 * Client met de service role key. ALLEEN op de server gebruiken —
 * deze sleutel omzeilt row level security.
 * Wordt gebruikt om leden uit te nodigen per e-mail.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY ontbreekt");

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
