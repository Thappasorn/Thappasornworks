# Recovery Guide — THAPPASORN WORKS

## Scenario A — Restore the whole database to a new Supabase project
1. Create a new Supabase project.
2. SQL Editor → run `supabase/schema.sql` (recreates tables, RLS, functions).
3. Re-create the owner auth user (Authentication → Users → Add user with `thappasorn.boonphu@gmail.com`).
4. Import rows from your latest `full-<timestamp>.json`:
   - Quick path: SQL Editor → for each table, use `insert into … select * from json_populate_recordset(null::public.<table>, '<json-array>')`.
   - Or write the array into the Table Editor's import (CSV) — use the per-table CSV exports.
5. Update `.env.local` / Vercel with the new project URL + anon + service-role keys. Redeploy.

## Scenario B — Restore a single table (e.g. projects)
1. Open the relevant export (`projects-<timestamp>.csv` or `.json`).
2. Supabase → Table Editor → `projects` → **Insert → Import data from CSV**, or run an `insert … json_populate_recordset` for JSON.
3. If replacing, `truncate public.projects;` first (careful — this deletes current rows).

## Scenario C — Accidental content deletion (recent)
- If Supabase PITR/daily backup is enabled: Dashboard → Database → Backups → **Restore** to a timestamp just before the deletion.
- Otherwise import the most recent export from `backups/`.

## Scenario D — Lost or deleted Cloudinary asset
1. Restore the original file from your Cloudinary auto-backup bucket (S3/GCS).
2. Re-upload with the **same `public_id`** so the existing URL in the DB keeps working.
3. If the URL must change, update the affected row's `thumbnail`/`gallery`/`profile_image` field in the admin dashboard.

## Scenario E — Full disaster (new everything)
1. `git clone` the repo (tagged release).
2. Recreate Supabase (Scenario A) + Cloudinary account; set env vars.
3. `npm install && npm run build` → deploy to Vercel.
4. Verify with the `DEPLOYMENT.md` post-deploy checklist.

## Sanity checks after any restore
- [ ] Homepage shows projects/reviews/logos.
- [ ] `/project/<known-slug>` resolves.
- [ ] Admin login works for the owner only.
- [ ] Images load (Cloudinary URLs valid).
- [ ] `sitemap.xml` regenerated with current slugs.
