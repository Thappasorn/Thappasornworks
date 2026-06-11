import { createClient } from "@supabase/supabase-js";

/**
 * Service-role / secret client — SERVER ONLY. Bypasses RLS so the verified
 * owner can write content reliably. Works with the new Supabase secret key
 * (sb_secret_...) or a legacy service_role JWT. Never import into client code.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const secret =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    "";
  return createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
