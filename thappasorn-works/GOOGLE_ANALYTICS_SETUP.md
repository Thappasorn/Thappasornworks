# Google Analytics 4 + Search Console Setup

## 1. Create a GA4 property
1. analytics.google.com → Admin → **Create Property**.
2. Add a **Web** data stream for your domain → copy the **Measurement ID** (`G-XXXXXXXXXX`).

## 2. Add the env var
In `.env.local` (and Vercel → Environment Variables):
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```
When this is empty, GA is fully disabled (no scripts load) — safe for local dev.

## 3. What is already wired
GA loads via `next/script` (`afterInteractive`) in `src/components/GoogleAnalytics.tsx` and is mounted in the locale layout. `send_page_view` is disabled and page views are sent on every client route change (SPA-correct).

### Tracked events
| Event | Where | GA action |
|---|---|---|
| Page views | every route change | `page_view` |
| Project detail views | `/project/[slug]` | `project_view` |
| Search usage | category page search | `search` (`search_term`) |
| Category visits | each category page | `category_visit` |
| Contact form submit | contact form | `contact_submit` |
| LINE clicks | contact + floating button | `line_click` |
| Email clicks | contact + floating button | `email_click` |
| Phone clicks | contact + floating button | `phone_click` |
| Language changes | language switcher | `language_change` |
| Downloads | admin backup exports | `file_download` |
| External links | `trackExternalLink()` helper | `click` (outbound) |

### Reusable utility — `src/lib/analytics.ts`
```ts
trackLineClick(); trackEmailClick(); trackPhoneClick();
trackProjectView(slug); trackSearch(term); trackLanguageChange(locale);
trackCategoryVisit(category); trackContactSubmit(projectType?);
trackDownload(fileName); trackExternalLink(url); trackPageView(url);
gaEvent(action, params); // raw escape hatch
```
The same helpers also mirror key actions to the custom Supabase dashboard via `/api/track`.

## 4. Google Search Console
1. search.google.com/search-console → Add property → **URL prefix** = your site URL.
2. Choose the **HTML tag** verification method, copy the `content` value of the meta tag.
3. Add it to env:
```
NEXT_PUBLIC_GSC_VERIFICATION=the_content_value
```
The locale layout injects `<meta name="google-site-verification" …>` automatically when set. Redeploy, then click **Verify**.
4. Submit your sitemap: `https://yourdomain.com/sitemap.xml`.

## 5. Verify it works
- `npm run dev`, open the site, then in GA4 → **Reports → Realtime** confirm an active user.
- Click LINE / change language / open a project → events appear under Realtime → Event count.
