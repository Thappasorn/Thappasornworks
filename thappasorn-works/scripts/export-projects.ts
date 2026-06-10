/**
 * Export projects → backups/projects-<timestamp>.json AND .csv
 * Usage:  npm run export:projects
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { adminClient, BACKUP_DIR, stamp, toCSV } from "./_lib";

async function main() {
  const supabase = adminClient();
  const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
  if (error) { console.error("✖", error.message); process.exit(1); }
  const rows = data ?? [];
  const base = join(BACKUP_DIR, `projects-${stamp()}`);
  writeFileSync(`${base}.json`, JSON.stringify(rows, null, 2));
  writeFileSync(`${base}.csv`, toCSV(rows));
  console.log(`✅ Exported ${rows.length} projects:\n   ${base}.json\n   ${base}.csv`);
}
main();
