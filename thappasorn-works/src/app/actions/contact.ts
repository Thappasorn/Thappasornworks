"use server";

import { createClient } from "@/lib/supabase/server";
import { EMAIL } from "@/lib/utils";

/** Public contact-form submission.
 *  1) Always stored in the `enquiries` table (admin Inbox).
 *  2) If RESEND_API_KEY is set, also emails the owner instantly.
 *     Email failure never blocks the enquiry — the DB copy is the source of truth. */
export async function submitEnquiry(input: { name: string; email: string; type?: string; msg?: string }) {
  const name = (input.name || "").trim().slice(0, 200);
  const email = (input.email || "").trim().slice(0, 200);
  if (!name || !email) throw new Error("Name and email are required");
  const project_type = (input.type || "").trim().slice(0, 200) || null;
  const message = (input.msg || "").trim().slice(0, 5000) || null;

  const supabase = await createClient();
  const { error } = await supabase.from("enquiries").insert({ name, email, project_type, message });
  if (error) throw new Error(`Could not send: ${error.message}`);

  // --- optional email notification via Resend ---
  const key = process.env.RESEND_API_KEY;
  if (key) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "THAPPASORN WORKS <onboarding@resend.dev>",
          to: [EMAIL],
          reply_to: email,
          subject: `📬 New enquiry — ${name}${project_type ? ` (${project_type})` : ""}`,
          text: `Name: ${name}\nEmail: ${email}\nProject type: ${project_type ?? "-"}\n\n${message ?? "(no message)"}\n\n— Sent from thappasornworks contact form. Reply to this email to answer ${name} directly.`,
        }),
      });
    } catch {
      // swallow — enquiry is already saved in the Inbox
    }
  }
}
