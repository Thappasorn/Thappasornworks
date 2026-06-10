"use client";
/**
 * Unified analytics for THAPPASORN WORKS.
 * - Sends events to Google Analytics 4 (gtag) when NEXT_PUBLIC_GA_MEASUREMENT_ID is set.
 * - Mirrors a subset to the custom Supabase dashboard via /api/track (fire-and-forget).
 * No secrets are ever referenced here — client-safe only.
 */

type Params = Record<string, unknown>;

declare global {
  interface Window { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[]; }
}

/** Raw GA4 event. */
export function gaEvent(action: string, params: Params = {}) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", action, params);
  }
}

/** Custom-dashboard beacon (Supabase analytics_events). */
function beacon(type: string, ref?: string) {
  try {
    const body = JSON.stringify({ type, ref, source: document.referrer });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/track", body);
    else fetch("/api/track", { method: "POST", body, keepalive: true });
  } catch { /* ignore */ }
}

/* ---------- Page / navigation ---------- */
export function trackPageView(url: string) {
  gaEvent("page_view", { page_path: url, page_location: typeof location !== "undefined" ? location.href : url });
  beacon("visit", url);
}
export function trackCategoryVisit(category: string) {
  gaEvent("category_visit", { category });
}

/* ---------- Content ---------- */
export function trackProjectView(slug: string) {
  gaEvent("project_view", { slug });
  beacon("project_view", slug);
}
export function trackSearch(term: string) {
  if (!term.trim()) return;
  gaEvent("search", { search_term: term });
}

/* ---------- Contact actions ---------- */
export function trackLineClick() { gaEvent("line_click"); beacon("line_click"); }
export function trackEmailClick() { gaEvent("email_click"); beacon("email_click"); }
export function trackPhoneClick() { gaEvent("phone_click"); beacon("phone_click"); }
export function trackContactSubmit(projectType?: string) {
  gaEvent("contact_submit", { project_type: projectType ?? "" });
  beacon("contact_submit");
}

/* ---------- UX / misc ---------- */
export function trackLanguageChange(locale: string) { gaEvent("language_change", { locale }); }
export function trackDownload(fileName: string) { gaEvent("file_download", { file_name: fileName }); }
export function trackExternalLink(url: string) { gaEvent("click", { link_url: url, outbound: true }); }

/** Back-compat generic used by older callers. */
export function track(type: string, ref?: string) {
  switch (type) {
    case "visit": return trackPageView(ref ?? (typeof location !== "undefined" ? location.pathname : "/"));
    case "project_view": return trackProjectView(ref ?? "");
    case "line_click": return trackLineClick();
    case "email_click": return trackEmailClick();
    case "phone_click": return trackPhoneClick();
    default: gaEvent(type, ref ? { ref } : {}); beacon(type, ref);
  }
}
