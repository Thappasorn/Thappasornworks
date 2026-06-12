"use server";

import { createClient } from "@/lib/supabase/server";

/** Public contact-form submission — stored in the `enquiries` table.
 *  RLS allows anonymous INSERT only; reading is owner-only. */
export async function submitEnquiry(input: { name: string; email: string; type?: string; msg?: string }) {
  const name = (input.name || "").trim().slice(0, 200);
  const email = (input.email || "").trim().slice(0, 200);
  if (!name || !email) throw new Error("Name and email are required");
  const supabase = await createClient();
  const { error } = await supabase.from("enquiries").insert({
    name,
    email,
    project_type: (input.type || "").trim().slice(0, 200) || null,
    message: (input.msg || "").trim().slice(0, 5000) || null,
  });
  if (error) throw new Error(`Could not send: ${error.message}`);
}
