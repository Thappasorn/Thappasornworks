# Deploy THAPPASORN WORKS to Vercel — Step by Step

## 0. Prerequisites
- GitHub (or GitLab/Bitbucket) account
- Vercel account (free Hobby tier is fine)
- Supabase account
- Cloudinary account
- Node 18.18+ locally (Node 20 LTS recommended)

## 1. Run locally first (sanity check)
```bash
npm install
npm run dev      # http://localhost:3000  → /en  (renders with seed data, no keys needed)
npm run build    # must succeed before deploying
```

## 2. Create the Supabase project
1. supabase.com → New project. Pick a region close to your audience.
2. SQL Editor → New query → paste the entire contents of `supabase/schema.sql` → **Run**.
   - Creates `projects`, `reviews`, `trusted_by`, `analytics_events`, RLS policies, and `increment_views()`.
3. Authentication → Providers → keep **Email** enabled; turn **OFF** "Allow new users to sign up" (single owner, no public registration).
4. Authentication → Users → **Add user** → enter your email + a strong password. This is your admin login.
5. Project Settings → API → copy:
   - Project URL  → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 3. Create the Cloudinary account
1. cloudinary.com → Dashboard.
2. Copy: Cloud name → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, API Key → `CLOUDINARY_API_KEY`, API Secret → `CLOUDINARY_API_SECRET`.

## 4. Push to GitHub
```bash
git init && git add -A && git commit -m "THAPPASORN WORKS"
git branch -M main
git remote add origin https://github.com/<you>/thappasorn-works.git
git push -u origin main
```

## 5. Import into Vercel
1. vercel.com → Add New → Project → import the repo.
2. Framework preset auto-detects **Next.js**. Leave build command (`next build`) and output as default.
3. **Environment Variables** → add each (Production + Preview + Development):
   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | from Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase |
   | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | from Cloudinary |
   | `CLOUDINARY_API_KEY` | from Cloudinary |
   | `CLOUDINARY_API_SECRET` | from Cloudinary |
   | `NEXT_PUBLIC_SITE_URL` | your final URL, e.g. https://thappasornworks.com |
   | `NEXT_PUBLIC_ADMIN_EMAIL` | your admin email (optional/informational) |
4. **Deploy**.

## 6. Domain
1. Vercel → Project → Settings → Domains → add your custom domain, follow DNS steps.
2. Update `NEXT_PUBLIC_SITE_URL` to the live domain → Redeploy (so sitemap/OG/hreflang use the right host).

## 7. Post-deploy checklist
- [ ] Visit `/en`, `/th`, `/cn`, `/jp` — language switch works, URLs change.
- [ ] `/en/admin` → redirects to `/en/admin/login` → sign in with your Supabase user.
- [ ] In the dashboard: add a project with an image upload → confirm it appears on the homepage + category page.
- [ ] Add a review and a client logo → confirm they render.
- [ ] `/sitemap.xml` and `/robots.txt` resolve.
- [ ] Click LINE / phone / email (incl. floating button) → check the Analytics tab counters rise.
- [ ] Enable **Vercel → Analytics** for the project (real visitor metrics alongside the custom dashboard).

## 8. Supabase Storage note
Media is stored in **Cloudinary**, not Supabase Storage — no bucket setup required. Supabase holds only metadata (URLs) + auth + analytics.

## Troubleshooting
- **"Unable to find next-intl locale"** → ensure `src/i18n/request.ts` returns `locale` (it does) and that the `[locale]` segment is present in the URL.
- **Images don't load** → the host must be in `next.config.ts` `images.remotePatterns` (Cloudinary + Unsplash are pre-added).
- **Admin can't save / "Not authenticated"** → you must be signed in (RLS blocks anonymous writes by design) and the SQL schema + policies must be applied.
- **Build fails on a type error** → run `npm run build` locally, fix, recommit; Vercel rebuilds on push.
