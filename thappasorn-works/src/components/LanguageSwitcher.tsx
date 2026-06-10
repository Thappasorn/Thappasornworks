"use client";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { trackLanguageChange } from "@/lib/analytics";

const LABEL: Record<string, string> = { en: "EN", th: "TH", cn: "CN", jp: "JP" };

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-white/10 p-1">
      {routing.locales.map((l) => (
        <button
          key={l}
          onClick={() => { trackLanguageChange(l); router.replace(pathname, { locale: l }); }}
          className={`rounded-full px-2.5 py-1 text-xs font-bold tracking-wide transition-colors ${
            l === locale ? "bg-accent text-bg" : "text-muted hover:text-accent"
          }`}
        >
          {LABEL[l]}
        </button>
      ))}
    </div>
  );
}
