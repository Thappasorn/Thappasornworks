"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function GoogleAnalytics() {
  const pathname = usePathname();
  useEffect(() => {
    if (GA_ID && typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "page_view", { page_path: pathname, page_location: window.location.href });
    }
  }, [pathname]);

  if (!GA_ID) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', '${GA_ID}', { send_page_view: false });
      `}</Script>
    </>
  );
}
