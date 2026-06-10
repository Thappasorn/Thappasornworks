import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

/** Minimal .env.local loader (no extra deps). */
function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const p = resolve(process.cwd(), file);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}
loadEnv();

export const BACKUP_DIR = resolve(process.cwd(), "backups");
if (!existsSync(BACKUP_DIR)) mkdirSync(BACKUP_DIR, { recursive: true });

export function stamp() {
  return new Date().toISOString().slice(0, 19).replace("T", "_").replace(/:/g, "-");
}

/** Service-role client — server-side only, NEVER bundle into the app. */
export function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("✖ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

export function toCSV(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const cols = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const esc = (v: unknown) => {
    const s = v == null ? "" : Array.isArray(v) ? v.join("|") : typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}
