import { NextRequest, NextResponse } from "next/server";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  if (!supabaseConfigured()) return NextResponse.json({ ok: true, skipped: true });
  let payload: { type?: string; ref?: string; source?: string } = {};
  try { payload = await req.json(); } catch { /* sendBeacon text */ }
  const type = payload.type ?? "visit";
  const country = req.headers.get("x-vercel-ip-country") ?? null;
  let source: string | null = null;
  try { source = payload.source ? new URL(payload.source).host : null; } catch { /* ignore */ }

  const supabase = await createClient();
  await supabase.from("analytics_events").insert({ type, ref: payload.ref ?? null, country, source });
  if (type === "project_view" && payload.ref) {
    await supabase.rpc("increment_views", { p_slug: payload.ref });
  }
  return NextResponse.json({ ok: true });
}
