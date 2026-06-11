import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { setRequestLocale, getMessages } from "next-intl/server";
import Nav from "@/components/Nav";
import FloatingContact from "@/components/FloatingContact";
import VisitTracker from "@/components/VisitTracker";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import "../globals.css";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://thappasornworks.com";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const titles: Record<string, string> = {
    en: "THAPPASORN WORKS — Creative Direction, Film & Photography",
    th: "THAPPASORN WORKS — กำกับงานสร้างสรรค์ ฟิล์ม และภาพถ่าย",
    cn: "THAPPASORN WORKS — 创意指导、影片与摄影",
    jp: "THAPPASORN WORKS — クリエイティブ・映像・写真",
  };
  return {
    metadataBase: new URL(SITE),
    title: titles[locale] ?? titles.en,
    description:
      "A premium creative portfolio — graphic design, short-form video, long-form film, photography and videography.",
    alternates: {
      canonical: `${SITE}/${locale}`,
      languages: { en: `${SITE}/en`, th: `${SITE}/th`, "zh-CN": `${SITE}/cn`, ja: `${SITE}/jp`, "x-default": `${SITE}/en` },
    },
    openGraph: { title: "THAPPASORN WORKS", type: "website", url: `${SITE}/${locale}`, images: ["/og.jpg"] },
    twitter: { card: "summary_large_image", title: "THAPPASORN WORKS", images: ["/og.jpg"] },
    verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }
      : undefined,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(routing.locales as readonly string[]).includes(locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem('theme')||'system';var d=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`,
          }}
        />
        <GoogleAnalytics />
        <NextIntlClientProvider messages={messages}>
          <VisitTracker />
          <Nav />
          <main>{children}</main>
          <FloatingContact />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
