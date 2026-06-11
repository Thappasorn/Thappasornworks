import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client — SERVER ONLY. Bypasses RLS so the authenticated owner
 * can write content reliably regardless of cookie/session propagation.
 * Never import this into a client component. The key is read from a
 * server-only env var (no NEXT_PUBLIC prefix), so it is never sent to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
