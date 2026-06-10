"use client";
import { useEffect } from "react";
export default function VisitTracker() {
  useEffect(() => {
    try {
      const body = JSON.stringify({ type: "visit", ref: window.location.pathname, source: document.referrer });
      if (navigator.sendBeacon) navigator.sendBeacon("/api/track", body);
      else fetch("/api/track", { method: "POST", body, keepalive: true });
    } catch { /* ignore */ }
  }, []);
  return null;
}
