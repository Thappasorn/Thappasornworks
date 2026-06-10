# THAPPASORN WORKS — Creative Portfolio Platform

Production-ready **Next.js 15 + TypeScript + TailwindCSS + Framer Motion** portfolio,
backed by **Supabase** (database + auth) and **Cloudinary** (media), deployable to **Vercel**.

Orange `#FF6B00` + Black `#0A0A0A` cinematic design system. Multilingual (EN / TH / CN / JP)
with locale routing. Single-owner admin dashboard with uploads, CRUD and analytics.

---

## ✨ Features
- **i18n routing** — `/en` `/th` `/cn` `/jp` (next-intl), auto locale detection, instant switch.
- **Homepage** — hero showreel, stats, featured projects, the 4 categories (latest 10 + *See All*), client reviews, trusted-by wall, contact.
- **Category pages** — `/graphics` `/shot-videos` `/long-form-video` `/filming-photography` with search, tag filter, sort (newest/oldest).
- **Project detail** — `/project/[slug]` with client, year, services, challenge/solution/results, gallery, related projects, per-page SEO.
- **Admin** — `/[locale]/admin` (Supabase Auth, single owner). Projects/Reviews/Logos CRUD, drag-free Cloudinary uploads (image + video, bulk gallery), feature toggles, and an **analytics dashboard** (visitors, project views, LINE/Email/Phone clicks, most-viewed projects).
- **Floating contact button** + contact section: LINE (with QR + deep link), email, phone.
- **SEO** — `sitemap.xml`, `robots.txt`, OpenGraph, Twitter cards, hreflang alternates.
- **Runs with zero config** — falls back to bundled seed data until you connect Supabase.

## 🧱 Tech
Next.js 15 (App Router) · TypeScript · TailwindCSS · Framer Motion · Supabase · Cloudinary · Vercel.

---

## 🚀 Local setup
```bash
npm install
cp .env.example .env.local      # fill in keys (optional for first run)
npm run dev                     # http://localhost:3000  → redirects to /en
```
Without keys you'll see the full site populated with **seed data**. Add keys to go live.

## 🗄️ Supabase
1. Create a project at supabase.com.
2. SQL Editor → paste **`supabase/schema.sql`** → Run. (Creates `projects`, `reviews`, `trusted_by`, `analytics_events`, RLS policies, and the `increment_views` function.)
3. Authentication → Users → **Add user** with your email/password — this is the single owner login. Set `NEXT_PUBLIC_ADMIN_EMAIL` to that email.
4. Project Settings → API → copy the URL, `anon` key and `service_role` key into `.env.local`.

Public visitors get read-only access; only the authenticated owner can write (enforced by RLS).

## ☁️ Cloudinary
1. Create a free Cloudinary account.
2. Dashboard → copy Cloud name, API key, API secret into `.env.local`.
3. Uploads in the admin dashboard are sent server-side (API secret never reaches the browser) and auto-optimized (`q_auto,f_auto`).

## 🔑 Environment variables (`.env.local`)
See `.env.example`. Required for production:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`,
`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_ADMIN_EMAIL`.

## ▲ Deploy to Vercel
1. Push to GitHub.
2. Import the repo in Vercel.
3. Add all env vars (Project → Settings → Environment Variables).
4. Deploy. Add your domain and set `NEXT_PUBLIC_SITE_URL` to it.
5. Enable **Vercel Analytics** (Project → Analytics) for visitor data alongside the built-in custom dashboard.

## 📁 Structure
```
src/
  app/[locale]/            home, category pages, project/[slug], admin
  app/api/track            analytics event collector
  app/sitemap.ts, robots.ts
  components/              Hero, Stats, Featured, CategorySection, Reviews,
                           TrustedBy, Contact, FloatingContact, Nav, …
  components/admin/        AdminDashboard (Projects/Reviews/Logos/Analytics)
  i18n/                    routing, request, messages/{en,th,cn,jp}.json
  lib/                     supabase/, cloudinary, data (with seed fallback), types
supabase/schema.sql        database schema + RLS
public/                    line-qr.png, og.jpg
```

## 🔐 Admin
Visit `/en/admin` → redirected to `/en/admin/login` → sign in with your Supabase user.
No public registration; one owner only.

## 📝 Notes
- The contact form uses a `mailto:` handoff by default — swap for a Supabase insert or an email API (Resend) if you want stored submissions.
- Video reviews & project videos accept Cloudinary URLs or external links.
