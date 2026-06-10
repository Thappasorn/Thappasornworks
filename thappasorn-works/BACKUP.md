# Backup Strategy — THAPPASORN WORKS

Covers the four things that constitute the live site: **database**, **media**, **environment variables**, **configuration**. The goal is a restore-in-under-an-hour posture.

> 🔒 Security: backups produced by the scripts and the admin dashboard contain **content rows only**. They never include Cloudinary secrets, the Supabase service-role key, or auth tokens. Keep the `backups/` folder out of git (already in `.gitignore`).

## 1. Supabase (database)
### Daily (automated by Supabase)
- Supabase Pro projects include automatic daily backups (Dashboard → Database → Backups). Enable Point-in-Time Recovery (PITR) for finer granularity.
- Free tier: run the script below on a schedule (cron / GitHub Action) instead.

### Weekly full export (this repo's script)
```bash
npm run backup:db        # → backups/full-<timestamp>.json  (projects, reviews, trusted_by, analytics_events)
npm run export:projects  # → backups/projects-<timestamp>.json + .csv
```
Requires `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

Schedule it with a GitHub Action (example): run `npm ci && npm run backup:db`, then upload `backups/` as an artifact or push to a private storage bucket.

### Admin dashboard (manual, anytime)
Sign in → **Backup** tab → export Full Database / Projects / Reviews / Logos as **JSON or CSV**. The "Last Backup" date is shown.

### Restore
See `RECOVERY_GUIDE.md`.

## 2. Cloudinary (media)
- **Export:** Cloudinary Dashboard → Media Library → select assets → Download, or use the Admin API to list/download. For scale, enable **Auto-backup** (Settings → Backup) to your own S3/GCS bucket — this is the recommended long-term option.
- **Recovery:** assets are referenced by URL in the `projects`/`reviews`/`trusted_by` rows, so restoring the database restores the references. Re-upload originals from your S3/GCS backup if an asset is deleted; keep the same `public_id` to preserve URLs.

## 3. Environment variables
- Keep a copy of `.env.local` in a password manager (1Password / Bitwarden) — **never** in git.
- Vercel stores them under Project → Settings → Environment Variables; export periodically with `vercel env pull .env.backup`.

## 4. Configuration
- The codebase is the source of truth (Next config, Tailwind, schema). Keep it in git with tags per release.
- `supabase/schema.sql` is the authoritative DB structure — re-runnable on a fresh project.

## Recommended cadence
| Asset | Frequency |
|---|---|
| Database (script/admin export) | weekly + before each big content change |
| Database (Supabase auto/PITR) | daily |
| Cloudinary auto-backup to S3/GCS | continuous |
| `.env` snapshot | on every change |
