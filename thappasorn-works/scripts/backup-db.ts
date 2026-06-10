/**
 * Full database backup → backups/full-<timestamp>.json
 * Usage:  npm run backup:db
 * Reads SUPABASE_SERVICE_ROLE_KEY from .env.local. Output contains content rows only.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { adminClient, BACKUP_DIR, stamp } from "./_lib";

const TABLES = ["projects", "reviews", "trusted_by", "analytics_events"] as const;

async function main() {
  const supabase = adminClient();
  const snapshot: Record<string, unknown> = { exportedAt: new Date().toISOString() };
  for (const table of TABLES) {
    const { data, error } = await supabase.from(table).select("*");
    if (error) { console.error(`✖ ${table}:`, error.message); process.exit(1); }
    snapshot[table] = data ?? [];
    console.log(`✓ ${table}: ${data?.length ?? 0} rows`);
  }
  const file = join(BACKUP_DIR, `full-${stamp()}.json`);
  writeFileSync(file, JSON.stringify(snapshot, null, 2));
  console.log(`\n✅ Backup written: ${file}`);
}
main();
